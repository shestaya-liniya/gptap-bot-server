import { INITIAL_SESSION } from '../constants/index.js'
import { OggDownloader } from '../utils/oggDownloader.js'
import { OggConverter } from '../utils/oggConverter.js'
import { OpenAI } from '../utils/openAi.js'
import { spinnerOff } from '../utils/spinner.js'

export const onForwardVoice = async (bot, msg) => {
  const { id: chatID } = msg.chat

  bot.context = msg

  const forwardOptions = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: 'Да, переведи', callback_data: 'translate' },
          { text: 'Нет, нужен GPT', callback_data: 'question' }
        ]
      ]
    })
  }

  const question = await bot.sendMessage(
    chatID,
    'Вы хотите перевести голосовое в текст?',
    forwardOptions
  )

  bot.context.answer_message_id = question.message_id
}

export const onCreateAnswer = async (bot, spinnerId, answerType) => {
  const msg = bot.context
  const { id: chatID } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }

  try {
    msg.ctx ??= INITIAL_SESSION

    const url = await bot.getFileLink(msg.voice.file_id)
    const userId = String(msg.from.id)

    const oggDownloader = new OggDownloader(url)

    const oggPath = await oggDownloader.download(userId)

    if (!oggPath) {
      await oggDownloader.delete()
      throw new Error('Something went wrong please try again.')
    }

    const oggConverter = new OggConverter(oggPath)

    const mp3Path = await oggConverter.toMp3(userId)
    await oggDownloader.delete()

    if (!mp3Path) {
      await oggConverter.delete()
      throw new Error('Something went wrong please try again.')
    }

    const openAi = new OpenAI(mp3Path)

    const data = await openAi.transcription()

    if (answerType == 'translate') {
      await oggConverter.delete()
      await spinnerOff(bot, chatID, spinnerId)
      return await bot.sendMessage(
        chatID,
        data,
        options
      )
    }

      const res = await bot.sendMessage(
        chatID,
        '...',
        options
      )

    await oggConverter.delete()

    msg?.ctx.messages.push({
      role: openAi.roles.User,
      content: data
    })

    const response = await openAi.chat(msg?.ctx.messages, bot, res, chatID)

    if (!response) {
      throw new Error('Something went wrong please try again.')
    }

    msg?.ctx.messages.push({
      role: openAi.roles.Assistant,
      content: response
    })

    await spinnerOff(bot, chatID, spinnerId)

  } catch (error) {
    if (error instanceof Error) {
      return await bot.sendMessage(
        chatID,
        error.message,
        options
      )
    }
  }
}
