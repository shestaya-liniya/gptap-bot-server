import { INITIAL_SESSION } from '../../constants/index.js'
import { db } from '../../db/index.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../../.env' })

export const setQuizModeForSubs = (bot) => {
  bot.onText(/^\/quiz+/ig, async msg => {
      const quiz_subs_available = 3
      const quiz_token_available = 3

      if (msg?.chat?.id == process.env.NOTIF_GROUP) {
        const text = msg.text.split('&&')
        const { id: chatId } = msg.chat
        const options = {
          parse_mode: 'HTML'
        }

        try {
          await db.subscriber.update(
            { quiz_subs_available, quiz_token_available },
            { where: { username: text[1] ?? msg.from.username } }
          ).then(() => {
            bot.sendMessage(process.env.NOTIF_GROUP,
              `🎁 subs +${quiz_subs_available}, tokens +${quiz_token_available} for ${text[1] ?? msg.from.username} `
            )
          })
        } catch (error) {
          await bot.sendMessage(chatId, `${error.message}`, options)
        }
      } else
        return true
    }
  )
}
