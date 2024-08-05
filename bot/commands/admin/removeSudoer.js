// Add sudo users who'll have ability to run the bot
// import { SUDOER } from "../db/mjSchema.js";
import { db } from '../../db/index.js'

export const removeSudoer = (bot, sudoUser) => {
  bot.onText(/\/rm/, async (msg, match) => {
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
    const sudoId = msg.text.replace(match[0], '').trim()
    if (sudoId.length === 0) {
      return bot.sendMessage(
        chatID,
        'sudoers: No user ID provided. Unable to proceed.',
        options
      )
    }

    try {
      db.sudouser.destroy({
        where: {
          userId: sudoId
        }
      }).then(res => {
        bot.sendMessage(
          chatID,
          'sudoers: User removed from sudoers. Permission revoked. Bot access disabled.',
          options
        )
      }).catch(res => {
        bot.sendMessage(
          chatID,
          'sudoers: User not found in sudoers. No action required.',
          options
        )
      })
    } catch (error) {
      await bot.sendMessage(
        chatID,
        'error: Invalid action. Please provide a valid action.',
        options
      )
    }
  })
}
