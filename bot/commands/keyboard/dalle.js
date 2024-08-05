import events from 'events'
import dotenv from 'dotenv'
import { keyboardChatGPT } from './chat_gpt.js'
import { COMMAND_DALL_E, COMMAND_GPT } from '../../constants/index.js'
import { db } from '../../db/index.js'
import { ct } from '../../utils/createTranslate.js'
import { keyboardMyAccount } from './my_account.js'
import { createStartKeyboardForReplyMarkup } from '../../utils/createStartKeyboard.js'
import { updatePinnedMessage } from '../../utils/updatePinnedMessage.js'

dotenv.config({ path: '../.env' })

export const keyboardDalle = async (bot, msg) => {
  const sendDalle = async (bot, chatId, options) => {
    const t = await ct(msg)
    let accountMessage = await bot.sendMessage(
      chatId,
      '🎨',
      options
    ).catch(err => console.log(err))

    const firstLevel = {
      message: t('start_dalle'),
      options: {
        ...options,
      }
    }

    const timeout = setTimeout((chatId, message_id, firstLevel, messageStart) => {
      bot.editMessageText(firstLevel.message, {
        chat_id: chatId,
        message_id: message_id,
        ...firstLevel.options
      }).then(() => updatePinnedMessage(COMMAND_DALL_E))
        .catch(() => {
        return true
      })
      clearTimeout(timeout)
    }, 1000, chatId, accountMessage?.message_id, firstLevel)

    const eventEmitter = new events.EventEmitter()

    eventEmitter.on(`buy_subscription_M_${chatId}`, async function() {
      eventEmitter.removeAllListeners()
      return keyboardMyAccount(bot, msg, accountMessage, keyboardDalle, null, 'buy')
    })

    eventEmitter.on(`${COMMAND_GPT}_M_${chatId}`, function() {
      eventEmitter.removeAllListeners()
      return keyboardChatGPT(bot, msg)
    })

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data, callbackQuery)
      bot.answerCallbackQuery(callbackQuery.id, 'keyboard/dall-e', false)
    })
  }

  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId,
  }
  try {
    db.subscriber.findOne({
      where: {
        chat_id: chatId,
        user_id: msg.from.id
      }
    }).then(res => {
      if (res?.dataValues.mode?.match(/\DALLE/))
        return sendDalle(bot, chatId, options)
      else if (res?.dataValues.mode) {
        db.subscriber.update(
          {
            mode: 'DALLE',
            first_name: msg.from.first_name,
            last_name: msg.from.last_name,
            username: msg.from.username,
            language_code: msg.from.language_code
          },
          { where: { chat_id: chatId } }
        ).then(res => {
          bot.select_mode = 'DALLE'
          return sendDalle(bot, chatId, options)
        })
      } else {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name,
          username: msg.from.username,
          language_code: msg.from.language_code,
          mode: 'DALLE'
        }).then(res => {
          bot.select_mode = 'DALLE'
          return sendDalle(bot, chatId, options)
        })
      }
    }).then(res => {

    })
  } catch
    (error) {
    await bot.sendMessage(chatId, `${error.message}`, options).catch(err => console.log(err))
  }
}