import dotenv from 'dotenv'
import { ct } from '../../utils/createTranslate.js'
import { keyboardMyAccount } from './my_account.js'

dotenv.config({ path: '../.env' })

export const isTokensEmpty = async (bot, msg, tokens, price) => {
  const t = await ct(msg)
  const { id: chatId } = msg.chat
  const msgId = msg.message_id

  const generalOptions = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId,
    disable_web_page_preview: true
  }
  try {
    await bot.sendMessage(chatId, t('msg:empty_tokens'), generalOptions)
  } catch (error) {
    await bot.sendMessage(chatId, `${error.message}`, generalOptions)
  }
}
