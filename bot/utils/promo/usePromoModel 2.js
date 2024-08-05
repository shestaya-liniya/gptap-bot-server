import { db } from '../../db/index.js'
import dotenv from 'dotenv'
import { setAttempts } from '../quiz/setAttempts.js'

dotenv.config()

export const usePromoModel = async (bot, code, chatId, from) => {
  if (code === 'X2PROMO') {
    await db.subscriber.findOne({
      where: {
        chat_id: chatId
      }
    }).then(async res => {
      if (res) {
        if (res.dataValues.tags?.includes(code)) {
          await bot.sendMessage(process.env.NOTIF_GROUP, `❗Повторно вводит ${code} @${from.username}`)
          await bot.sendMessage(chatId,
            `Этот промо-код уже использован.`)

        } else {
          const att = setAttempts(res.dataValues, code)
          await db.subscriber.update(
            {
              tags: `${res.dataValues.tags ? res.dataValues.tags : ''}` + `#${code}`,
              ...att
            },
            { where: { chat_id: chatId } }
          ).then(async res => {
            await bot.sendMessage(process.env.NOTIF_GROUP, `🎫 ${from.first_name} активировал промокод ${code} @${from.username}`)
            await bot.sendMessage(chatId,
              `🙄 ОК! Колличество попыток для Викторины на этой неделе увеличено в 2 раза! Удачи!`)
          })
        }
      }
    })
  }
}