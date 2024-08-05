import { saveAndSendPhoto, saveAndSendPreloaderPhoto } from '../../../utils/saveAndSendPhoto.js'
import { loaderOn } from '../../../utils/loader.js'
import { db } from '../../../db/index.js'
import { TYPE_RESPONSE_MJ } from '../../../constants/index.js'
import events from 'events'
import { upscale } from './upscale.js'

export const variation = async (prompt, Imagine, client, query, bot, chatID, prevMessageId, userMessageId) => {
  const eventEmitter = new events.EventEmitter()
    let waiting = await loaderOn(0, bot, chatID)

  try {
    // if (prevMessageId)
    //   await bot.deleteMessage(chatID, prevMessageId).catch(() => {
    //     console.log("🔺 variation | error remove loader ", prevMessageId)
    //   })

    const { id: chat_id, title: chat_name } = query.message.chat
    const { message_id } = query.message
    const selectedLabel = query.data
    const selectedL = selectedLabel.split('+')[0]

    const VCustomID = Imagine.options?.find(
      o => (o.custom.includes(selectedL) || o.label.includes(selectedL))
    )?.custom

    const Variation = await client.Custom({
      msgId: Imagine.id,
      flags: Imagine.flags,
      customId: VCustomID,
      content: prompt,
      loading: async (uri, progress) => {
        // console.log(`Loading: ${uri}, progress: ${progress}`)
        waiting = await saveAndSendPreloaderPhoto(uri, chatID, bot, waiting?.message_id, progress)
      }
    })

    const { id: user_id, username } = query.from
    await db.midjourney.create({
      query_id: query.id,
      message_id,
      chat_instance: query.chat_instance,
      chat_id,
      chat_name,
      user_id,
      username,
      prompt
      // data: selectedLabel
    })

    const options = {
      reply_to_message_id: userMessageId,
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            { text: '📸 1', callback_data: `U1++${waiting.message_id}` },
            { text: '📸 2', callback_data: `U2++${waiting.message_id}` },
            { text: '📸 3', callback_data: `U3++${waiting.message_id}` },
            { text: '📸 4', callback_data: `U4++${waiting.message_id}` }
          ],
          [
            { text: '♻️ 1', callback_data: `V1++${waiting.message_id}` },
            { text: '♻️ 2', callback_data: `V2++${waiting.message_id}` },
            { text: '♻️ 3', callback_data: `V3++${waiting.message_id}` },
            { text: '♻️ 4', callback_data: `V4++${waiting.message_id}` }
          ],
          [{ text: '🔄 Regenerate', callback_data: '🔄' }]
        ]
      })
    }

    const imgUrl = Variation.uri
    const imgDir = './variations'
    const filePath = `${imgDir}/${message_id}.png`

    const prevMessage = await saveAndSendPhoto(imgUrl, imgDir, filePath, chatID, bot, options, TYPE_RESPONSE_MJ.PHOTO, waiting)

    for (let i = 1; i < 5; i++) {
      eventEmitter.on(`V${i}++${waiting.message_id}`, async function(query) {
        await variation(prompt, Variation, client, query, bot, chatID, prevMessage.message_id, userMessageId)
      })
    }
    for (let i = 1; i < 5; i++) {
      eventEmitter.on(`U${i}++${waiting.message_id}`, async function(query) {
        await upscale(Variation, client, query, bot, chatID, prevMessage.message_id, userMessageId)
      })
    }
    eventEmitter.on(`🔄++${waiting.message_id}`, async function(query) {
      await variation(prompt, Variation, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data, callbackQuery)
      bot.answerCallbackQuery(callbackQuery.id, 'midjourney variation', false)
      eventEmitter.removeAllListeners()
    })

  } catch (error) {
    bot.deleteMessage(chatID, waiting.message_id).then()
    eventEmitter.removeAllListeners()
    // await client.Reset()
    // client.Close()
    await bot.sendMessage(chatID, `${error}`)
  }
}