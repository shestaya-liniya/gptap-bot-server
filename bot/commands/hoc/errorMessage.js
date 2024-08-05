import { autoRemoveMessage } from './autoRemoveMessage.js'
import { db } from '../../db/index.js'
import { ct } from '../../utils/createTranslate.js'

// TODO: Если у пользователя ошибка с таймаутом ChatGPT то создать очередь запросов создав 2 действия.
//  Отправить предупреждение о очереди.
//  Запустить таску на очередь

export const errorMessage = async (bot, error, msg, component) => {
  const t = await ct(msg)
   const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msg.message_id
    }

  const message = `⚡️\n${error.message ?? error}`
  console.log('error', error)
  let subValues = []

  await db.subscriber.findOne({
    where: {
      user_id: msg.from?.id
    }
  }).then(sub => {
    console.log('seb', sub.dataValues)
    for (let key in sub.dataValues) {
      subValues.push(`${key}: ${sub.dataValues[key]}`)
    }
    bot.sendMessage(process.env.SENTRY_GROUP, `⚡️ <b>${message}</b> \n\n🔺 <b>${component || 'not found'}</b>\n\n${subValues.join('\n')}`, {parse_mode: 'HTML'})
    bot.sendMessage(msg.from.id, `☠️ ${t('msg:error')}\nError: ${msg.from?.id}`, options)
  })

//   bot.sendMessage(process.env.SENTRY_GROUP, `
// Пользователь: ${msg.from.username} ID ${msg.from.id}\n
// `)

  // await autoRemoveMessage(message, bot, chatID, options, 10000)
}