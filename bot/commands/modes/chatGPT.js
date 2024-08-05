import { INITIAL_SESSION, REQUEST_TYPES } from '../../constants/index.js'
import { OpenAI } from '../../utils/openAi.js'
import { spinnerOff, spinnerOn } from '../../utils/spinner.js'
import { errorMessage } from '../hoc/errorMessage.js'
import { modesChatGPT } from '../../constants/modes.js'
import { db } from '../../db/index.js'
import { exceptionForHistoryLogging } from '../../utils/exceptionForHistoryLogging.js'
import { createFullName } from '../../utils/createFullName.js'
import { ct } from '../../utils/createTranslate.js'
import { writingOffTokens } from '../../utils/checkTokens.js'

export async function cleanContext (chatID) {
  await db.subscriber.update(
      { comment: null },
      { where: { chat_id: chatID } }
    )
}

export const modeChatGPT = async (bot, msg, qweryOptions) => {
  const t = await ct(msg)
  let res
  let modeGPT
  let newMessage
  let ctx
  const { id: userId } = msg.from
  const { id: chatID } = msg.chat
  const msgId = msg.message_id
  const options = {
    reply_to_message_id: msgId,
    ...qweryOptions
  }

  try {
    await db.subscriber.findOne({
      where: {
        chat_id: chatID,
        user_id: msg.from.id
      }
    }).then(async response => {
      modeGPT = response.dataValues.modeGPT
      ctx = await JSON.parse(response.dataValues.comment)
    })

    ctx ??= INITIAL_SESSION

    console.log('🔺ctx', ctx.messages.length)

    res = await spinnerOn(bot, chatID, null, 'chatGPT')
    let message = await bot.sendMessage(chatID, '...').catch(() => {
      console.log('🔺 37')
      return true
    })

    const openAi = new OpenAI()

    let x = modesChatGPT.find(mode => mode.code === modeGPT)

    if (modeGPT === 'assistant') {
      newMessage = msg.text ?? msg.sticker?.emoji
      await cleanContext(chatID)
    } else if (msg.text) {
      newMessage = await t(x?.prompt_start)
      newMessage = newMessage + '\n\n' + msg.text
    } else {
      newMessage = msg.sticker.emoji
    }

    ctx.messages.push({
      role: openAi.roles.User,
      content: newMessage
    })

    const response = await openAi.chat(ctx.messages, bot, message, chatID, x.parse_mode)

    const textSum = (response + newMessage)

    await writingOffTokens(bot, msg, REQUEST_TYPES.GPT, textSum)

    if (!response) {
      throw new Error('Something went wrong please try again.')
    }

    ctx.messages.push({
      role: openAi.roles.Assistant,
      content: response
    })

    await db.subscriber.update(
      { comment: JSON.stringify(ctx) },
      { where: { chat_id: chatID } }
    )

    await spinnerOff(bot, chatID, res)

    db.history.update({
      chat_id: msg.chat.id,
      nickname: msg.chat.username,
      fullname: createFullName(msg.from),
      response: exceptionForHistoryLogging(msg.from.id, response)
    }, { where: { message_id: msg.message_id } }).catch()

    await bot.editMessageText(
      response ? response : '..:',
      {
        ...options,
        message_id: message.message_id,
        chat_id: chatID,
        parse_mode: x['parse_mode']
      }
    ).catch(() => {
      console.log('🔺 89')
      return true
    })

    return {
      text: response,
      message_id: message.message_id
    }
  } catch
    (error) {
    if (error instanceof Error) {
      await spinnerOff(bot, chatID, res)
      return errorMessage(bot, error, chatID)
    }
  }
}