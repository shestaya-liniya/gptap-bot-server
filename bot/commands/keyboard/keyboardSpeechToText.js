export const keyboardSpeechToText = (bot, msg) => {
  bot.sendMessage(msg.chat.id, `🎤 В этом режиме я могу перевести голосовое сообщение в тест. Просто запиши для меня голосовое или перешли чужое аудиосообщение в этот чат.`).catch()
}