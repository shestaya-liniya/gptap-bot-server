import { db } from '../../db/index.js'
import { COMMAND_GPT, COMMAND_MIDJOURNEY } from '../../constants/index.js'
import events from 'events'
import dotenv from 'dotenv'
import { keyboardChatGPT } from './chat_gpt.js'
import { ct } from '../../utils/createTranslate.js'
import { keyboardMyAccount } from './my_account.js'
import { updatePinnedMessage } from '../../utils/updatePinnedMessage.js'

dotenv.config({ path: '../.env' })

/*

TODO: Добавить обработку русскоязычных запросов.

При входе в режим MI
1. Показать короткую инструкцию (в ней
        кол-во бесплатных запросов (либо инф о тарифе), порно-правила
         кнопка с покупкой и кнопка с отменой (выйти из режима))

2. Отключение режима GPT и обработка ответного текста:
    1. Созранить статус включенного режима /mi
    2. Установить if если этот режим - отправлять запрос в MI а не в GPT
    3. После отправки запроса показать информацию о примерном времени генерации и перейти к режиму чат



    😢 У вас недостаточно запросов, чтобы выполнить это действие. Для генерации изображения, необходимо хотя бы один запрос. Восполним запасы?


1. при выборе ВАРИАЦИИ 4 в первый раз, дал вариант, с кнопками для второго запроса.
2. при выборе повторной варианции отдал сначала (не верный )

 */


export const keyboardMidjourney = async (bot, msg) => {
  const msgID = msg.message_id
  const sendMidjourney = async (bot, chatId, options) => {
    const t = await ct(msg)
    let accountMessage = await bot.sendMessage(
      chatId,
      '✏️',
      options
    ).catch(err => console.log(err))

    const firstLevel = {
      message: t('start_midjourney'),
      options: {
        ...options,
      }
    }

    const timeout = setTimeout((chatId, message_id, firstLevel, messageStart) => {
      bot.editMessageText(firstLevel.message, {
        chat_id: chatId,
        message_id: message_id,
        ...firstLevel.options
      }).then(() => updatePinnedMessage(COMMAND_MIDJOURNEY))
        .catch(() => {
        console.log('🔺83')
        return true
      })
      clearTimeout(timeout)
    }, 1000, chatId, accountMessage.message_id, firstLevel)

    const eventEmitter = new events.EventEmitter()

    eventEmitter.on(`buy_subscription_M_${msgID}`, async function() {
      eventEmitter.removeAllListeners()
      return keyboardMyAccount(bot, msg, accountMessage, keyboardMidjourney)
    })

    eventEmitter.on(`${COMMAND_GPT}_M_${msgID}`, function() {
      eventEmitter.removeAllListeners()
      return keyboardChatGPT(bot, msg)
    })

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data, callbackQuery)
      bot.answerCallbackQuery(callbackQuery.id, 'keyboard/midjourney', false)
    })
  }

  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const options = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId
  }
  try {
    db.subscriber.findOne({
      where: {
        chat_id: chatId,
        user_id: msg.from.id
      }
    }).then(res => {
      if (res?.dataValues.mode?.match(/\MIDJOURNEY/))
        return sendMidjourney(bot, chatId, options)
      else if (res?.dataValues.mode) {
        db.subscriber.update(
          {
            mode: 'MIDJOURNEY',
            first_name: msg.from.first_name,
            last_name: msg.from.last_name,
            username: msg.from.username,
            language_code: msg.from.language_code
          },
          { where: { chat_id: chatId } }
        ).then(res => {
          bot.select_mode = 'MIDJOURNEY'
          return sendMidjourney(bot, chatId, options)
        })
      } else {
        db.subscriber.create({
          chat_id: chatId,
          user_id: msg.from.id,
          first_name: msg.from.first_name,
          last_name: msg.from.last_name,
          username: msg.from.username,
          language_code: msg.from.language_code,
          mode: 'MIDJOURNEY'
        }).then(res => {
          bot.select_mode = 'MIDJOURNEY'
          return sendMidjourney(bot, chatId, options)
        })
      }
    }).then(res => {

    })
  } catch
    (error) {
    await bot.sendMessage(chatId, `${error.message}`, options).catch(err => console.log(err))
  }
}