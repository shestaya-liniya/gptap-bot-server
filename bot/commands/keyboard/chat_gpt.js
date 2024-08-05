import events from 'events'
import { db } from '../../db/index.js'
import { modesChatGPT } from '../../constants/modes.js'
import { createStartKeyboardForReplyMarkup } from '../../utils/createStartKeyboard.js'
import { ct } from '../../utils/createTranslate.js'
import { updatePinnedMessage } from '../../utils/updatePinnedMessage.js'
import { COMMAND_GPT } from '../../constants/index.js'

export const keyboardChatGPT = async (bot, msg) => {
  const t = await ct(msg)
    const { GPT_model } = await db.subscriber.findOne({ where: { user_id: msg.from.id } })

  const sendChatGPT = async (bot, chatId, options, modeGPT) => {

    console.log('modeGPT', modeGPT)

    const character = (mGPT) => modesChatGPT.find(mode => mode.code === mGPT)

    let accountMessage = await bot.sendMessage(
      chatId,
      '🤖',
      options
    )

    const firstMessage = {
      text: `<b>ChatGPT</b> ${GPT_model === 'gpt-4' ? '4' : '3.5'} – ${t(character(modeGPT)?.name)}\n${t(character(modeGPT)?.welcome)}`,
      options: {
        ...options,
        reply_markup: {
          inline_keyboard: [
            [{ text: t('btn_change_mode'), callback_data: `CHANGE_CHAT_MODE:${chatId}` }]
          ]
        }
      }
    }

    const secondMessage = {
      text: t('msg_chat_mode'),
      options: {
        ...options,
        reply_markup: {
          inline_keyboard: modesChatGPT.map((mode) => [{ text: t(mode.name), callback_data: mode.code }])
        }
      }
    }

    const timeout = setTimeout(async (chatId, message_id) => {
      clearTimeout(timeout)
      await bot.editMessageText(
        firstMessage.text,
        {
          chat_id: chatId,
          message_id,
          ...firstMessage.options
        }
      ).then(() => updatePinnedMessage(COMMAND_GPT))
    }, 1000, chatId, accountMessage.message_id)

    const eventEmitter = new events.EventEmitter()

    eventEmitter.on(`CHANGE_CHAT_MODE:${chatId}`, async function() {
      await bot.editMessageText(
        secondMessage.text,
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...secondMessage.options
        }
      ).then(() => updatePinnedMessage(COMMAND_GPT))
        .catch((err) => {
        console.log(err)
      })
    })

    for (let i = 0; i < modesChatGPT.length; i++) {
      eventEmitter.on(modesChatGPT[i].code, async function() {
        await db.subscriber.update(
          { modeGPT: modesChatGPT[i].code },
          { where: { chat_id: chatId } }
        ).then(async res => {
          // TODO: если это премиум то нужно менять на нужную модель чата в заголовке
          await bot.editMessageText(
            `<b>ChatGPT</b> 3.5 – ${t(character(modesChatGPT[i].code)?.name)}\n${t(character(modesChatGPT[i].code)?.welcome)}`,
            {
              message_id: accountMessage.message_id,
              chat_id: chatId,
              ...firstMessage.options
            }
          ).catch(() => {
            return true
          })

        }).catch(err => console.error(err))
      })
    }

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data)
      bot.answerCallbackQuery(callbackQuery.id, 'chat_gpt', false)
    })
  }


  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId,
    reply_markup: createStartKeyboardForReplyMarkup(msg)
  }
  try {
    db.subscriber.findOne({
      where: {
        chat_id: chatId,
        user_id: msg.from.id
      }
    }).then(subscriberRes => {

      if (subscriberRes?.dataValues.mode?.match(/\GPT/))
        return sendChatGPT(bot, chatId, options, subscriberRes.dataValues.modeGPT)
      else if (subscriberRes?.dataValues.mode) {
        db.subscriber.update(
          {
            mode: 'GPT',
            user_id: msg.from.id,
            first_name: msg.from.first_name,
            last_name: msg.from.last_name,
            username: msg.from.username,
            language_code: msg.from.language_code
          },
          { where: { chat_id: chatId } }
        ).then(() => {
          bot.select_mode = 'GPT'
          return sendChatGPT(bot, chatId, options, subscriberRes.dataValues.modeGPT)
        })
      } else {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name,
          username: msg.from.username,
          language_code: msg.from.language_code,
          mode: 'GPT'
        }).then(res => {
          bot.select_mode = 'GPT'
          return sendChatGPT(bot, chatId, options, res.dataValues.modeGPT)
        })
      }
    })
  } catch
    (error) {
    await bot.sendMessage(chatId, `${error.message}`, options)
  }
}