import { cleanContext, modeChatGPT } from './modes/chatGPT.js'
import events from 'events'
import { db } from '../db/index.js'
import { removeQueryFromPrevMessage } from './hoc/removeQueryFromPrevMsg.js'
import { modesChatGPT } from '../constants/modes.js'
import { INITIAL_SESSION } from '../constants/index.js'
import { autoRemoveMessage } from './hoc/autoRemoveMessage.js'
import { keyboardChatGPT } from './keyboard/chat_gpt.js'

export const onMessageTextDefault = async (bot, msg, match, sudoUser, t) => {
  const { id: chatID } = msg.chat
  const msgId = msg.message_id

  const optionsGeneral = {
    reply_to_message_id: msgId
  }

  try {
    let firstMessage
    if (msg.text?.match(/^\/+/ig))
      return
    // TODO: Рефакторинг для минимизации обращения к бд.
    // TODO: BUG: При удалении базы данных и начале нового диалоге не создается сообщение в бд пока не выберается тип.
    // TODO: написать код который будет обрабатывать поступление смайликов и стикеров, по возможности отвечать на них

    const qweryOptions = {
      ...optionsGeneral,
      reply_markup: {
        inline_keyboard: [
          [{ text: t('btn_new_chat'), callback_data: `create_new_chat${msgId}` },
            { text: t('btn_change_mode'), callback_data: `change_chat_mode${msgId}` }]
        ]
      }
    }

    bot.on('message', async () => {
        if (firstMessage) {
          eventEmitter.removeAllListeners() // исправление бага с отработкой слушателя прежних сообщений
          await removeQueryFromPrevMessage(bot, chatID, firstMessage)
        }
      }
    )


    const eventEmitter = new events.EventEmitter()

    eventEmitter.on(`create_new_chat${msgId}`, async function() {
      await autoRemoveMessage('✅ ' + t('btn_new_chat'), bot, chatID, {},10000)
      await cleanContext(chatID)
    })

    eventEmitter.on(`change_chat_mode${msgId}`, async function() {
      await bot.editMessageText(
        firstMessage.text,
        {
          message_id: firstMessage.message_id,
          chat_id: chatID,
          reply_markup: {
            inline_keyboard: modesChatGPT.map((mode) => [{ text: t(mode.name), callback_data: mode.code }])
          }
        }
      ).catch((err) => {
        console.log('🔺 change_chat_mode', err)
        return true
      })
    })

    eventEmitter.on('first_step', async function() {
      await bot.editMessageText(
        firstMessage.text,
        {
          message_id: firstMessage.message_id,
          chat_id: chatID,
          ...qweryOptions
        }
      ).catch((err) => {
        console.log('🔺 first_step ', err)
        return true
      })
    })

    for (let i = 0; i < modesChatGPT.length; i++) {
      eventEmitter.on(modesChatGPT[i].code, async function() {
        await db.subscriber.update(
          { modeGPT: modesChatGPT[i].code },
          { where: { chat_id: chatID } }
        ).then(async res => {
          await removeQueryFromPrevMessage(bot, msg.chat.id, firstMessage)
          // bot.deleteMessage(chatID, firstMessage.message_id).catch(err => console.error(err))
          firstMessage = modeChatGPT(bot, msg, {
            message_id: firstMessage.message_id,
            chat_id: chatID
          })
        }).catch(err => console.error(err))
      })
    }

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data)
      bot.answerCallbackQuery(callbackQuery.id, 'on_message_text_default', false)
    })

    // TODO: Показывать сообщение только один раз, когда человек вводит первое сообщение при выбранном моде chat
    // await infoMessageWithChatGPT(bot, chatID)
    firstMessage = await modeChatGPT(bot, msg, qweryOptions).catch(err => console.error(err))
  } catch
    (error) {
    if (error instanceof Error) {
      return await bot.sendMessage(
        chatID,
        error.message,
        optionsGeneral
      )
    }
  }
}