import { ct } from './createTranslate.js'

export const stepperOn = async (bot, msg, stepNowIndex, prevMessage) => {
  const t = await ct(msg)
  const done = '✅'
  const wait = '⏩'

  const stepsArray1 = [
    t("msg:converter1ph"),
    t("msg:converter2ph"),
    t("msg:converter3ph"),
    t("msg:converter4ph"),
    t("msg:converter5ph"),
  ]

  const steps = stepsArray1.map((step, index) => {
    return `${index <= stepNowIndex ? done : wait}  ${step}\n`
  })

  if (prevMessage) {
    return bot.editMessageText(steps.join(''),
      {
        chat_id: msg.from.id,
        message_id: prevMessage.message_id
      }
    )
  } else {
    const answer = await bot.sendMessage(
      msg.from.id,
      steps.join('')
    )
    return new Promise(res => res(answer))
  }
}