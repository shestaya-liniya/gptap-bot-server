import events from 'events'
import dotenv from 'dotenv'
import { keyboardChatGPT } from './chat_gpt.js'
import { COMMAND_GPT, VOICES } from '../../constants/index.js'
import { db } from '../../db/index.js'
import { ct } from '../../utils/createTranslate.js'
import { updatePinnedMessage } from '../../utils/updatePinnedMessage.js'

dotenv.config({ path: '../.env' })

export const keyboardTextToSpeech = async (bot, msg) => {
  const t = await ct(msg)
  const sendTextToSpeech = async (bot, chatId, options) => {
    let accountMessage = await bot.sendMessage(
      chatId,
      '🗣',
      options
    ).catch(err => console.log(err))

    const firstLevel = {
      message: t('start_tts'),
      options: {
        ...options,
        reply_markup: {
          inline_keyboard: [
            [{ text: t('btn_select_voice'), callback_data: `voice_M_${chatId}` }]
          ]
        }
      }
    }

    const buyLevel = {
      message: t('select_voice'),
      options: {
        ...options,
        reply_markup: {
          inline_keyboard: [
            [{ text: VOICES[0].text, callback_data: `${VOICES[0].callback_data}_M_${chatId}` }],
            [{ text: VOICES[1].text, callback_data: `${VOICES[1].callback_data}_M_${chatId}` }],
            [{ text: VOICES[2].text, callback_data: `${VOICES[2].callback_data}_M_${chatId}` }],
            [{ text: VOICES[3].text, callback_data: `${VOICES[3].callback_data}_M_${chatId}` }],
            [{ text: VOICES[4].text, callback_data: `${VOICES[4].callback_data}_M_${chatId}` }],
            [{ text: VOICES[5].text, callback_data: `${VOICES[5].callback_data}_M_${chatId}` }],
            [{ text: t('return_to_menu'), callback_data: `first_voice_M_${chatId}` }]
          ]
        }
      }
    }

    const timeout = setTimeout((chatId, message_id, firstLevel, messageStart) => {
      bot.editMessageText(firstLevel.message, {
        chat_id: chatId,
        message_id: message_id,
        ...firstLevel.options
      }).then(() => updatePinnedMessage(t('keyboard_tts').trim()))
        .catch(() => {
        return true
      })
      clearTimeout(timeout)
    }, 1000, chatId, accountMessage?.message_id, firstLevel)

    const eventEmitter = new events.EventEmitter()

    eventEmitter.on(`voice_M_${chatId}`, async function() {
      await bot.editMessageText(
        buyLevel.message,
        {
          message_id: accountMessage?.message_id,
          chat_id: chatId,
          ...buyLevel.options
        }
      ).catch(err => console.log(err))
    })

    for (let i = 0; i < VOICES.length; i++) {
      eventEmitter.on(`${VOICES[i].callback_data}_M_${chatId}`, function() {
        db.subscriber.update(
          {
            mode: 'TTS',
            tts_voice: VOICES[i].callback_data
          },
          { where: { chat_id: chatId } }
        ).then(() => {
          bot.editMessageText(
            t('selected_voice', { 0: VOICES[i].text }),
            {
              message_id: accountMessage.message_id,
              chat_id: chatId,
              ...firstLevel.options
            }
          )
        })
      })
    }

    eventEmitter.on(`first_voice_M_${chatId}`, function() {
      bot.editMessageText(
        firstLevel.message,
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...firstLevel.options
        }
      ).catch(err => console.log(err))
    })

    eventEmitter.on(`${COMMAND_GPT}_M_${chatId}`, function() {
      return keyboardChatGPT(bot, msg)
    })

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data, callbackQuery)
      bot.answerCallbackQuery(callbackQuery.id, 'keyboard/tts', false)
    })
  }

  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }
  try {
    db.subscriber.findOne({
      where: {
        chat_id: chatId,
        user_id: msg.from.id
      }
    }).then(res => {
      if (res?.dataValues.mode?.match(/\TTS/))
        return sendTextToSpeech(bot, chatId, options)
      else if (res?.dataValues.mode) {
        db.subscriber.update(
          {
            mode: 'TTS',
            first_name: msg.from.first_name,
            last_name: msg.from.last_name,
            username: msg.from.username,
            language_code: msg.from.language_code
          },
          { where: { chat_id: chatId } }
        ).then(res => {
          bot.select_mode = 'TTS'
          return sendTextToSpeech(bot, chatId, options)
        })
      } else {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name,
          username: msg.from.username,
          language_code: msg.from.language_code,
          mode: 'TTS'
        }).then(res => {
          bot.select_mode = 'TTS'
          return sendTextToSpeech(bot, chatId, options)
        })
      }
    }).then(res => {

    })
  } catch
    (error) {
    await bot.sendMessage(chatId, `${error.message}`, options).catch(err => console.log(err))
  }
}