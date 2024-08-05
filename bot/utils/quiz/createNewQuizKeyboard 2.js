import { db } from '../../db/index.js'

export const createNewQuizKeyboard = async (res, msgId, t, chatId) => {
  const keyboard = []
  const keyboard2 = []
  // проверить, если с даты блокировки прошло ровно 7 дней - обнулить
  const dateFreezeQuiz = res.dataValues?.quiz_reboot_date
  const today = new Date()
  const daysHavePassed = (today - dateFreezeQuiz) / 1000 / 60 / 60 / 24
  const VALUES = 5;
  const { dataValues } = await db.settings.findOne({ where: { user_id: 0 } })

  if ((res?.dataValues?.quiz_subs_available === 0 && res.dataValues?.quiz_token_available === 0)
    && (dataValues['days_freez'] - daysHavePassed) <= 0) {
    db.subscriber.findOne(
      { where: { chat_id: chatId } }
    ).then(() => {

      db.subscriber.update(
        {
          quiz_reboot_date: null,
          quiz_subs_available: VALUES,
          quiz_token_available: VALUES
        },
        { where: { chat_id: chatId } }
      ).then(() => {
        keyboard.push({
          text: `${t('btn_win_subs')} (${VALUES})`,
          callback_data: `WIN_SUBS_${msgId}`
        })
        keyboard2.push({
          text: `${t('btn_win_tokens')} (${VALUES})`,
          callback_data: `WIN_REQ_${msgId}`
        })
      })
    })
  } else if ((dataValues['days_freez'] - daysHavePassed) >= 0) {
    keyboard.push({ text: t('new_quiz_after_week'), callback_data: `NO_ATTEMPTS` })
  } else {
    if (res?.dataValues?.quiz_subs_available !== 0)
      keyboard.push({
        text: `${t('btn_win_subs')} (${res.dataValues.quiz_subs_available})`,
        callback_data: `WIN_SUBS_${msgId}`
      })
    if (res?.dataValues?.quiz_token_available !== 0)
      keyboard2.push({
        text: `${t('btn_win_tokens')} (${res.dataValues.quiz_token_available})`,
        callback_data: `WIN_REQ_${msgId}`
      })
  }

  return [keyboard, keyboard2]
}