import { COMMAND_DALL_E, COMMAND_GPT, COMMAND_MIDJOURNEY } from '../constants/index.js'
import { ct } from './createTranslate.js'

export const createStartKeyboardForReplyMarkup = async (msg) => {
  const t = await ct(msg)

  return {
    resize_keyboard: true,
    one_time_keyboard: false,
    keyboard: [
      [
        { text: COMMAND_GPT },
        { text: COMMAND_DALL_E },
        { text: COMMAND_MIDJOURNEY }
      ],
      [
        { text:  t('keyboard_tts') },
        { text:  t('keyboard_convertor') }
      ],
    ]
  }
}