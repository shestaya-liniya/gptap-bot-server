import { db } from '../db/index.js'
import { Sequelize } from 'sequelize'
import { updatePinnedMessage } from './updatePinnedMessage.js'
import { bot, invoiceCanBeCreated } from '../../app.js'

export const sendStarInvoice = async (tokens, stars, userId) => {
  let invoiceId;

  if(invoiceCanBeCreated) {
    invoiceCanBeCreated = false
    const invoice = {
      title: 'Buy Tokens',
      description: `Buy ${tokens} Tokens for ${stars} Stars`,
      payload: `${tokens}`,
      provider_token: '',
      currency: 'XTR',
      prices: [
        { label: `${tokens} tokens`, amount: stars }, // Amount in smallest units (e.g., cents)
      ],
    };

    await db.subscriber.findOne({
      where: {
        user_id: userId
      }
    }).then(async user => {
      console.log(user)
      await bot.sendMessage(user.chat_id, "<blockquote class=\"language-javascript\"><strong>By purchasing GPT Tokens you also support the GPTap Team 🫶</strong></blockquote>", {
        parse_mode: "HTML"
      })
      await bot
        .sendInvoice(
          user.chat_id,
          invoice.title,
          invoice.description,
          invoice.payload,
          invoice.provider_token,
          invoice.currency,
          invoice.prices,
          {
            parse_mode: 'MarkdownV2',
          }).then(msg => {
          invoiceId = msg.message_id
        })
      bot.on('successful_payment', async (msg) => {

        const chatId = msg.chat.id;
        const tokensPayload = msg.successful_payment.invoice_payload
        invoiceCanBeCreated = true

        bot.deleteMessage(user.chat_id, invoiceId)

        await db.subscriber.update(
          {
            tokens: Sequelize.literal(`tokens + ${tokensPayload}`),
          },
          { where: { chat_id: user.chat_id } }
        )
        await bot.sendMessage(chatId, 'Thank you for your purchase 🙌! \n<strong>- GPTap Team</strong>\n \nAnd now go ahead to generate awesome images or talking with chatGPT about philosophy 🥳', {
          parse_mode: "HTML"
        });
        updatePinnedMessage()
      });
      bot.on('pre_checkout_query', (query) => {
        bot.answerPreCheckoutQuery(query.id, true);
      });
    })
  }
}
