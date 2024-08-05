import { ct } from '../createTranslate.js'

// возможно, в перспективе нужно создать класс оплаты
export const referralLevelCreator = async (msg, generalOptions, msgId, component = '') => {
  const t = await ct(msg)
  return {
    message: t('msg:referal-desc', {link: '@PiraJoke'}),
    options: {
      ...generalOptions,
      reply_markup: {
        inline_keyboard: [
          [{ text: t('btn:back-to-menu'), callback_data: `get_first_level_A_${msgId}` }] // добавить component ?
        ]
      }
    }
  }
}
