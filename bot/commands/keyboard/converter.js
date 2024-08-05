import { errorMessage } from '../hoc/errorMessage.js'
import { ct } from '../../utils/createTranslate.js'
import { updatePinnedMessage } from '../../utils/updatePinnedMessage.js'

export const keyboardConverter = async (bot, msg) => {
  const t = await ct(msg)
  let accountMessage = await bot.sendMessage(
    msg.chat.id,
    '💱'
  ).catch(err => console.log(err))

  try {
    const timeout = setTimeout(async (msg, message_id) => {
      bot.editMessageText(
        t('desc_converter'),
        {
          chat_id: msg.chat.id,
          message_id: message_id,
          parse_mode: 'HTML',
        }).then(() => updatePinnedMessage(t('keyboard_convertor').trim()))
        .catch(() => {
        return true
      })
      clearTimeout(timeout)
    }, 1500, msg, accountMessage?.message_id)
  } catch (e) {
    bot.deleteMessage(msg.chat.id, accountMessage.message_id)
    return errorMessage(bot, e.message, msg, 'keybourd/converter')
  }
}