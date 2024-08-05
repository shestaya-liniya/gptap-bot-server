import { autoRemoveMessage } from './autoRemoveMessage.js'

export const infoMessageWithChatGPT = async (bot, chatID) => {
  const message = `📬 Для смены темы разговора или режима нажмите кнопку ниже. Это поможет быстро и легко начать обсуждение другой темы.`
  const optionsWithQuery = {
    parse_mode: 'HTML',
  }
  await autoRemoveMessage(message, bot, chatID, optionsWithQuery, 10000)
}