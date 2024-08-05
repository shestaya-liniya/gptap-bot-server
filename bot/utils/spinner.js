const emojis = ['🐾', '🤖', '💡', '🚀', '⌛️', '👾', '👻', '👽', '🦊']
const emojiChat = ['🤖', '👽']

export const spinnerOn = async (bot, chat_id, type, component) => {
  const coll = type === "GPT" ? emojiChat : emojis;
  const message = await bot.sendMessage(
    chat_id,
    coll[Math.floor(Math.random() * coll.length)]
  )
  console.log("🔺 spinner on", message.message_id, component);
  const timeout = setInterval(() => {
    bot.editMessageText(
      coll[Math.floor(Math.random() * coll.length)],
      {
        message_id: message.message_id,
        chat_id
      }
    ).then(() => {
      clearInterval(timeout)
    }).catch(() => {
      clearInterval(timeout)
      return true
    })
  }, 5000)
  return message.message_id
}

export const spinnerOff = async (bot, chat_id, message_id) => {
  return bot.deleteMessage(
    chat_id,
    message_id?.message_id ?? message_id
  ).catch()
}