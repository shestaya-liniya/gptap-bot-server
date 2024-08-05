import { INITIAL_SESSION } from '../../constants/index.js'
import { db } from '../../db/index.js'
import { Op, Sequelize } from 'sequelize'
import { ct } from '../../utils/createTranslate.js'

export const refundTokensIfError = bot => {
  bot.onText(/\/refund/, async msg => {
    if (msg?.chat?.id == process.env.NOTIF_GROUP) {
      const t = await ct(msg)
      const { id: chatId } = msg.chat
      const msgId = msg.message_id
      const { id } = msg.from
      const options = {
        parse_mode: 'HTML',
        reply_to_message_id: msgId
      }

      try {
        const errors = await db.convertor_requests.findAll({ where: { [Op.or]: [{ status: 'work' }, { status: 'error' }] } })

        if (errors.length) {
          errors.map(async error => {

            await db.convertor_requests.update(
              { status: 'refund' },
              { where: { document_id: error['document_id'] } }
            )

            await db.subscriber.update(
              { tokens: Sequelize.literal(`tokens + ${error['price_tokens']}`) },
              { where: { chat_id: error['chat_id'] } }
            )

            await bot.sendMessage(
              error['chat_id'],
              t('msg:refund', { tokens: error['price_tokens'] })
            )
          })

          await bot.sendMessage(
            process.env.NOTIF_GROUP,
            `Произведен возврат токенов следующим пользователям: \n${errors.map(({
                                                                                   chat_id,
                                                                                   price_tokens
                                                                                 }) => `👮‍♀️${chat_id} ➕${price_tokens}\n`).join('')}`
          )
        } else {
          await bot.sendMessage(
            process.env.NOTIF_GROUP,
            'Задач со статусом завершения из-за ошибки не найдено.'
          )
        }

      } catch (error) {
        await bot.sendMessage(chatId, `${error.message}`, options)
      }
    }
  })
}
