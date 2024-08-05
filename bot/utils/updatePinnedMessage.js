import { db } from '../db/index.js'
import { bot } from '../../app.js'
import { originalChatId } from '../../app.js'

export let PINNED_MESSAGE_ID;
let PREV_PINNED_MESSAGE_ID;
let PINNED_MESSAGE = ""
let MODE = ""

export async function updatePinnedMessage(mode = null, fromStart = false) {
  console.log(originalChatId)
  await db.subscriber.findOne({
    where: {
      chat_id: originalChatId
    }
  }).then(res => {

    if(mode) {
      MODE = mode
    }

    PINNED_MESSAGE = `Tokens: ${res.tokens} Mode: ${MODE}`;
    console.log(`Tokens: ${res.tokens} Mode: ${MODE}`)

    if(fromStart) PINNED_MESSAGE_ID = null

    if(PREV_PINNED_MESSAGE_ID) {
      bot.deleteMessage(originalChatId, PREV_PINNED_MESSAGE_ID)
    }

    bot.sendMessage(originalChatId, PINNED_MESSAGE)
      .then((sentMessage) => {
        PINNED_MESSAGE_ID = sentMessage.message_id;
        PREV_PINNED_MESSAGE_ID = PINNED_MESSAGE_ID
        bot.pinChatMessage(originalChatId, PINNED_MESSAGE_ID)
      })
  })
}