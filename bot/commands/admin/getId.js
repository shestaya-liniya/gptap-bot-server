import { INITIAL_SESSION } from '../../constants/index.js'

export const getId = bot => {
  bot.onText(/\/id/, async msg => {
    if (msg?.chat?.id == process.env.NOTIF_GROUP) {
      const { id: chatId } = msg.chat
      const msgId = msg.message_id
      const { id } = msg.from
      const options = {
        parse_mode: 'HTML',
        reply_to_message_id: msgId
      }

      try {
        await bot.sendMessage(
          chatId,
          id,
          options
        )
      } catch (error) {
        await bot.sendMessage(chatId, `${error.message}`, options)
      }
    }
  })
}
