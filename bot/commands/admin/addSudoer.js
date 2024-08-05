// Add sudo users who'll have ability to run the bot
import { db } from '../../db/index.js'

// TODO: УДАЛИТЬ ЭТОТ ФАЙЛ ПОСЛЕ СОЗДАНИЯ МОДЕЛИ ВАЛИДАЦИИ ОПЛАТЫ
export const addSudoer = (bot, sudoUser) => {
  let sudoId
  bot.onText(/\/sudo/, async (msg, match) => {
    const { id: userId } = msg.from
    const { id: chatID } = msg.chat
    const msgId = msg.message_id
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId
    }

    if (userId !== sudoUser) {
      return bot.sendMessage(
        chatID,
        'permission denied: You do not have sufficient privileges to execute this command.',
        options
      )
    }
    // User id that is going to be added as sudo
    sudoId = msg.text.replace(match[0], '').trim()

    if (sudoId.length === 0) {
      return bot.sendMessage(
        chatID,
        'sudoers: No user ID provided. Unable to proceed.',
        options
      )
    }

    try {
      db.sudouser.create({
        userId: parseInt(sudoId, 10)
      }).then(() => {
        bot.sendMessage(
          chatID,
          'sudoers: User successfully added. Bot access granted.',
          options
        )
      })
        .catch(err => {
          bot.sendMessage(
            chatID,
            err.error,
            options
          )
        })
    } catch (error) {
      let errorMessage = ''
      if (error.code === 11000) {
        errorMessage +=
          'error: User ID already exists. Please select a different user ID.'
      } else {
        errorMessage += 'error: Invalid ID type specified.'
      }
      await bot.sendMessage(chatID, errorMessage, options)
    }
  })
}
