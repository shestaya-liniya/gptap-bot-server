export const autoRemoveMessage = async (content, bot, chatId, options = {}, duration = 5000) => {
  const message = await bot.sendMessage(chatId, `・ \n${content}`, options)
  const durationTemplate = '・'

  for (let i = 0; duration / 1000 >= i; i++) {
    const timeout = setTimeout((bot, chatId, message, durationTemplate, duration, options) => {
      bot.editMessageText(
        `${durationTemplate.repeat(duration / 1000 - i)}\n${content}`,
        {
          chat_id: chatId,
          message_id: message.message_id,
          parse_mode: 'HTML',
          ...options
        }
      ).catch(() => {
        return true
      })
      clearTimeout(timeout)
    }, i * 1000, bot, chatId, message, durationTemplate, duration, options)
  }

  const remove = setTimeout(async (bot, chatId, message) => {
    clearTimeout(remove)
    await bot.deleteMessage(chatId, message.message_id).catch(() => {
      return true
    })
  }, duration, bot, chatId, message)
}