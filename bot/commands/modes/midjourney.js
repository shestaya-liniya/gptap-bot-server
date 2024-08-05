import { Midjourney } from 'midjourney'
import { saveAndSendPhoto, saveAndSendPreloaderPhoto } from '../../utils/saveAndSendPhoto.js'
import { loaderOn } from '../../utils/loader.js'
import { REQUEST_TYPES, TYPE_RESPONSE_MJ } from '../../constants/index.js'
import { upscale } from './midjourney/upscale.js'
import events from 'events'
import { variation } from './midjourney/variation.js'
import dotenv from 'dotenv'
import { writingOffTokens } from '../../utils/checkTokens.js'

dotenv.config()

export const modeMidjourney = async (bot, sudoUser, msg, match) => {
  const eventEmitter = new events.EventEmitter()
  let userMessageId
  let prompt
  let client
  let Imagine

  userMessageId = msg.message_id
  prompt = msg.text?.replace(match[0], '').trim() ?? msg.sticker.emoji
  const { id: chatID } = msg.chat
  const options = {
    reply_to_message_id: userMessageId
  }
  // if (
  //   !(await sudoChecker(
  //     userId,
  //     username || firstname,
  //     sudoUser,
  //     bot,
  //     chatID,
  //     options
  //   ))
  // ) {
  //   return
  // }
  if (prompt.length === 0) {
    return bot.sendMessage(chatID, 'Prompt can\'t be empty', options)
  }

  // let spinner = await spinnerOn(bot, chatID, null, 'mijourney 39')
  let waiting = await loaderOn(0, bot, chatID)

  try {
    const { SERVER_ID, CHANNEL_ID, SALAI_TOKEN } = process.env
    client = new Midjourney({
      ServerId: SERVER_ID,
      ChannelId: CHANNEL_ID,
      SalaiToken: SALAI_TOKEN,
      // BotId: process.env.MJBot,
      // BotId: process.env.NijiBot,
      Debug: true,
      Ws: true
    })
    await client.init()

    Imagine = await client.Imagine(prompt, async (uri, progress) => {
      // console.log(`Loading: ${uri}, progress: ${progress}`)
      waiting = await saveAndSendPreloaderPhoto(uri, chatID, bot, waiting?.message_id, progress)
    })

    const options = {
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
          [{ text: '🔄 Regenerate', callback_data: `🔄++${waiting.message_id}` }]
        ]
      })
    }
    const imgUrl = Imagine.uri
    const imgDir = './Imagines'
    const filePath = `${imgDir}/${userMessageId}.png`

    const prevMessage = await saveAndSendPhoto(imgUrl, imgDir, filePath, chatID, bot, options, TYPE_RESPONSE_MJ.PHOTO, waiting)

    await writingOffTokens(bot, msg, REQUEST_TYPES.MIDJOURNEY)

    for (let i = 1; i < 5; i++) {
      eventEmitter.on(`V${i}++${waiting.message_id}`, async function(query) {
        await variation(prompt, Imagine, client, query, bot, chatID, prevMessage.message_id, userMessageId)
      })
    }

    for (let i = 1; i < 5; i++) {
      eventEmitter.on(`U${i}++${waiting.message_id}`, async function(query) {
        await upscale(Imagine, client, query, bot, chatID, prevMessage.message_id, userMessageId)
      })
    }

    eventEmitter.on(`🔄++${waiting.message_id}`, async function(query) {
      await variation(prompt, Imagine, client, query, bot, chatID, prevMessage.message_id, userMessageId)
    })

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data, callbackQuery)
      bot.answerCallbackQuery(callbackQuery.id, 'midjourney main', false)
    })

  } catch (error) {
    // bot.deleteMessage(chatID, waiting.message_id).then()
    // eventEmitter.removeAllListeners()
    // await client.Reset()
    // client.Close()
    console.log('catch')
    await bot.sendMessage(chatID, `${error}`)
  }
}