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

    const formattedTokens = formatNumberWithSpaces(res.tokens)

    PINNED_MESSAGE =
      `<blockquote class="language-javascript">⭐ <strong>${formattedTokens}</strong> tokens \n<strong><i>${MODE}</i></strong></blockquote>`;

    if(fromStart) PINNED_MESSAGE_ID = null

    if(PREV_PINNED_MESSAGE_ID) {
      bot.deleteMessage(originalChatId, PREV_PINNED_MESSAGE_ID)
    }

    bot.sendMessage(originalChatId, PINNED_MESSAGE, {
      parse_mode: "HTML"
    })
      .then((sentMessage) => {
        PINNED_MESSAGE_ID = sentMessage.message_id;
        PREV_PINNED_MESSAGE_ID = PINNED_MESSAGE_ID
      })
  })
}

function formatNumberWithSpaces(number) {
  // Convert the number to a string
  let numStr = number.toString();

  // Use a regular expression to add a space every three digits from the end
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}