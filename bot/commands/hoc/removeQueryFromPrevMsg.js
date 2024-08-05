export const removeQueryFromPrevMessage = async (bot, chatID, firstMessage) => {
  return await bot.editMessageText(
    firstMessage.text,
    {
      message_id: firstMessage.message_id,
      chat_id: chatID
    }
  ).catch(err => console.log(err))
}