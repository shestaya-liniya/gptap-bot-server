import { createStartKeyboardForReplyMarkup } from '../../utils/createStartKeyboard.js'

export const keyboardHelp = async (bot, msg, t) => {
  let accountMessage
  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId,
    reply_markup: createStartKeyboardForReplyMarkup(msg)
  }

  try {
          accountMessage = await bot.sendMessage(
        chatId,
        '🔍',
        options
      )

      const timeout = setTimeout(() => {
        // TODO: Сделать подсчет колличества бесплатных запросов в сутки на бесплатном режиме
        accountMessage = bot.editMessageText(
          t('description_help'),
          {
            message_id: accountMessage.message_id,
            chat_id: chatId,
            ...options
          }
        ).catch(() => {
          return true
        })
        clearTimeout(timeout)
      }, 1000)
  } catch (error) {
    await bot.sendMessage(chatId, `${error.message}`, options)
  }
}
