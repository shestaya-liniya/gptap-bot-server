import { INITIAL_SESSION } from '../../constants/index.js'

export const resetQuiz = bot => {
  bot.onText(/\/rq/, async msg => {
    if (msg?.chat?.id == process.env.NOTIF_GROUP) {
      const { id: chatId } = msg.chat
      const msgId = msg.message_id
      const { id } = msg.from
      const options = {
        parse_mode: 'HTML',
        reply_to_message_id: msgId
      }

      try {
        /*лучше созданять дату и время, когда у человека будет доступна следубщая игра
        позже при открытии этим пользователем викторины я должен буду проверить эту дату
        если эта дата будет*/
      } catch (error) {
        await bot.sendMessage(chatId, `${error.message}`, options)
      }
    }
  })
}
