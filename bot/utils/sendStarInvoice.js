import { db } from '../db/index.js'
import { bot } from '../../app.js'
import Config from './config.js'

export const sendStarInvoice = async (tokens, stars, userId) => {
  const config = Config

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
          config.setInvoiceId(msg.message_id)
      })
  })

}
