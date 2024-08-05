/*
:SOLO
  image1
1  2  3  4  <-  Upscale component
5  6  7  8  <-  Upscale component
9  10  11 12  <-  Upscale component
 */

import { saveAndSendPhoto, saveAndSendPreloaderPhoto } from '../../../utils/saveAndSendPhoto.js'
import { TYPE_RESPONSE_MJ } from '../../../constants/index.js'
import { loaderOn } from '../../../utils/loader.js'
import events from 'events'
import { variation } from './variation.js'

export const upscale = async (Variation, client, query, bot, chatID, prevMessageId, userMessageId) => {
  const eventEmitter = new events.EventEmitter()
  let waiting = await loaderOn(0, bot, chatID)

  try {
    // if (prevMessageId)
    //   await bot.deleteMessage(chatID, prevMessageId).catch(() => {
    //     console.log('🔺 upscale | error remove loader ', prevMessageId)
    //   })

    const upscaleLabel = query.data
    const selectedL = upscaleLabel.split('+')[0]

    const upscaleCustomID = Variation.options?.find(
      o => (o.custom.includes(selectedL) || o.label.includes(selectedL))
    )?.custom

    const upscaleCustom = await client.Custom({
      msgId: Variation.id,
      flags: Variation.flags,
      customId: upscaleCustomID,
      loading: async (uri, progress) => {
        // console.log(`Loading: ${uri}, progress: ${progress}`)
        waiting = await saveAndSendPreloaderPhoto(uri, chatID, bot, waiting.message_id, progress)
      }
    })
    console.log('upscaleCustom', upscaleCustom)
    const options = {
      reply_to_message_id: userMessageId,
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: '📸 Subtle', callback_data: `upsample_v6_2x_subtle++${waiting.message_id}` },
            { text: '📸 Creative', callback_data: `upsample_v6_2x_creative++${waiting.message_id}` }],
          [{ text: '♻️ Subtle', callback_data: `low_variation++${waiting.message_id}` },
            { text: '♻️ Strong', callback_data: `high_variation++${waiting.message_id}` }],
          [{ text: '🔍 out 2x', callback_data: `Outpaint::50++${waiting.message_id}` },
            { text: `🔍 out 1.5x`, callback_data: `Outpaint::75++${waiting.message_id}` }],
          [{ text: '⬅️', callback_data: `pan_left++${waiting.message_id}` },
            { text: '➡️', callback_data: `pan_right++${waiting.message_id}` },
            { text: '⬆️', callback_data: `pan_up++${waiting.message_id}` },
            { text: '⬇️', callback_data: `pan_down++${waiting.message_id}` }
          ],
          [{ text: '💎 Download file', callback_data: `DOWNLOAD++${waiting.message_id}` }]
        ]
      })
    }

    const imgUrl = upscaleCustom.uri
    const imgDir = './upscale'
    const filePath = `${imgDir}/${userMessageId}.png`

    const prevMessage = await saveAndSendPhoto(
      imgUrl,
      imgDir,
      filePath,
      chatID,
      bot,
      options,
      TYPE_RESPONSE_MJ.PHOTO,
      waiting
    )

    eventEmitter.on(`upsample_v6_2x_subtle++${waiting.message_id}`, async function(query) {
      await upscale(upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`upsample_v6_2x_creative++${waiting.message_id}`, async function(query) {
      await upscale(upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`low_variation++${waiting.message_id}`, async function(query) {
      await variation(null, upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`high_variation++${waiting.message_id}`, async function(query) {
      await variation(null, upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`Inpaint++${waiting.message_id}`, async function(query) {
      await variation(null, upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`Outpaint::50++${waiting.message_id}`, async function(query) {
      await variation(null, upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`Outpaint::75++${waiting.message_id}`, async function(query) {
      await variation(null, upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`CustomZoom++${waiting.message_id}`, async function(query) {
      await variation(null, upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`pan_left++${waiting.message_id}`, async function(query) {
      await variation(null, upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`pan_right++${waiting.message_id}`, async function(query) {
      await variation(null, upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })
    eventEmitter.on(`pan_up++${waiting.message_id}`, async function(query) {
      await variation(null, upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`pan_down++${waiting.message_id}`, async function(query) {
      await variation(null, upscaleCustom, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    eventEmitter.on(`DOWNLOAD++${waiting.message_id}`, async function(query) {
      await saveAndSendPhoto(
        imgUrl,
        imgDir,
        filePath,
        chatID,
        bot,
        { reply_to_message_id: userMessageId },
        TYPE_RESPONSE_MJ.DOCUMENT,
        waiting
      )
    })

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data, callbackQuery)
      bot.answerCallbackQuery(callbackQuery.id, 'midjourney upscale', false)
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