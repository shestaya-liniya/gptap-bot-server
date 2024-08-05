import { db } from '../db/index.js'
import dotenv from 'dotenv'
import { ct } from '../utils/createTranslate.js'
import { createStartKeyboardForReplyMarkup } from '../utils/createStartKeyboard.js'
import { updatePinnedMessage } from '../utils/updatePinnedMessage.js'
import { COMMAND_GPT } from '../constants/index.js'
import {originalChatId} from '../../app.js'
import Lang_enModel from '../db/models/lang_en.model.js'

dotenv.config()

export const startBot = async bot => {
  bot.onText(/\/start|\/echo/, async msg => {
    const t = await ct(msg)
    const { id: chatId } = msg.chat
    const msgId = msg.message_id
    const { id } = msg.from
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId,
      reply_markup: await createStartKeyboardForReplyMarkup(msg)
    }

    try {
      await bot.sendMessage(
        chatId,
        t('start'),
        options
      )


      // TODO:  Вынести в отдельную функцию
      await db.subscriber.findOne({
        where: {
          chat_id: chatId,
          user_id: msg.from.id
        }
      }).then(async res => {
        if (res) {
          await db.subscriber.update(
            {
              user_id: msg.from.id,
              first_name: msg.from.first_name,
              last_name: msg.from.last_name,
              username: msg.from.username,
              language_code: msg.from.language_code
            },
            { where: { chat_id: chatId } }
          )
        } else {
          await db.subscriber.create({
            chat_id: chatId,
            user_id: msg.from.id,
            first_name: msg.from.first_name,
            last_name: msg.from.last_name,
            username: msg.from.username,
            language_code: msg.from.language_code
          })
        }
        const emoji = (msg.from.id === 6221051172) || (msg.from.id === 963869223) ? '🐾' : '➕';
        await bot.sendMessage(process.env.NOTIF_GROUP, `${emoji} ${msg.from.first_name} @${msg.from.username}`)
      })
      await updatePinnedMessage(COMMAND_GPT.toString(), true)

    } catch (error) {
      await bot.sendMessage(chatId, `${error.message} \n ${JSON.stringify(msg)} \n ${chatId}`, options)
    }
  })
  bot.onText(/\/buy|\/echo/, async (msg) => {
    const chatId = msg.chat.id;
    const msgId = msg.message_id
    const { id } = msg.from
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId,
      reply_markup: await createStartKeyboardForReplyMarkup(msg)
    }


    const invoice = {
      title: 'Buy subscription',
      description: "Description hahaha",
      payload: 'payload',
      provider_token: '',
      currency: 'XTR',
      prices: [
        { label: '1000 tokens', amount: 1 }, // Amount in smallest units (e.g., cents)
      ],
    };

    try {
      await bot
        .sendInvoice(
          chatId,
          invoice.title,
          invoice.description,
          invoice.payload,
          invoice.provider_token,
          invoice.currency,
          invoice.prices);
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message} \n ${JSON.stringify(msg)} \n ${chatId}`, options)
    }
  });
  bot.on('pre_checkout_query', (query) => {
    bot.answerPreCheckoutQuery(query.id, true);
  });

// Handle successful payments
  bot.on('successful_payment', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Thank you for your purchase!');
  });
}
