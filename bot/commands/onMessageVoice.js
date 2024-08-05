import { INITIAL_SESSION } from '../constants/index.js'
import { OggDownloader } from '../utils/oggDownloader.js'
import { OggConverter } from '../utils/oggConverter.js'
import { OpenAI } from '../utils/openAi.js'
import { onCreateAnswer, onForwardVoice } from './onForwardVoice.js'
import { spinnerOn } from '../utils/spinner.js'

export const onMessageVoice = (bot) => {
  bot.on('voice', async (msg, match) => {
    let res
    const { id: userId } = msg.from
    const { id: chatID } = msg.chat
    const msgId = msg.message_id
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId
    }

    if (msg.forward_from) {
      return onForwardVoice(bot, msg)
    }

    try {
      msg.ctx ??= INITIAL_SESSION

      res = await bot.sendMessage(
        chatID,
        '...',
        options
      )

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

      const { message_id } = res
      await bot.editMessageText(
        `...${data}...`,
        {
          ...options,
          message_id
        }
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
    } catch (error) {
      if (error instanceof Error) {
        return await bot.sendMessage(
          chatID,
          error.message,
          options
        )
      }
    }
  })

  bot.on('callback_query', async query => {
    const { id: chat_id, title: chat_name } = query.message.chat
    const { message_id } = query.message
    const selectedLabel = query.data

    if (selectedLabel === 'translate' || selectedLabel === 'question') {
      if (bot.context?.answer_message_id)
        await bot.deleteMessage(
          chat_id,
          bot.context.answer_message_id
        )

      const spinId = await spinnerOn(bot, chat_id, null, 'onMessageVoice 107')

      if (bot.context) {
        if (selectedLabel.includes('translate')) {
          await onCreateAnswer(bot, spinId, 'translate')
        } else if (selectedLabel.includes('question')) {
          await onCreateAnswer(bot, spinId, 'question')
        }
      }
      bot.context = null
    }
  })
}