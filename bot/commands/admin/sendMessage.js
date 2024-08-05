import { INITIAL_SESSION } from '../../constants/index.js'
import { db } from '../../db/index.js'
// TODO: сделать цикл и возможность отправки сообщений группам пользователей
export const sendMessage = bot => {
  bot.onText(/^\/msg+/ig, async msg => {
    if (msg?.chat?.id === process.env.NOTIF_GROUP) {
      const text = msg.text.split('&&')
      const { id: chatId } = msg.chat
      const options = {
        parse_mode: 'HTML'
      }
      msg['ctx'] = INITIAL_SESSION
      try {
        if (text[1] === 'all') {
          const subscribers = await db.subscriber.findAll({
            subQuery: false,
            order: [['createdAt', 'DESC']]
          })

          if (msg['reply_to_message'].photo.length) {
            console.log('msg[\'reply_to_message\'].photo', msg['reply_to_message'].photo)
            //   отправить всем пользователям сообщение с картинкой
            // subscribers.map(user => bot.sendPhoto(user['chat_id']))
          } else {
            subscribers.map(user => bot.sendMessage(user.chat_id, '🔮'))
          }
        } else {
          await bot.sendMessage(
            text[1],
            `🤖\n${text[2]}`,
            options
          )
        }
      } catch (error) {
        await bot.sendMessage(chatId, `${error.message}`, options)
      }
    }
  })
}
