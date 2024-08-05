import { INITIAL_SESSION, TARIFS } from '../../constants/index.js'
import { db } from '../../db/index.js'
import * as events from 'events'
import { PAYOK } from 'payok'
import { nanoid } from 'nanoid'
import dotenv from 'dotenv'
import { ct } from '../../utils/createTranslate.js'
import { referralLevelCreator } from '../../utils/payments/referralLevelCreator.js'
import { keyboardQuiz } from './quiz.js'
import Stripe from 'stripe'
import { createFullName } from '../../utils/createFullName.js'
import { numberWithSpaces } from '../../utils/numberWithSpaces.js'
import { createStartKeyboardForReplyMarkup } from '../../utils/createStartKeyboard.js'
import { updatePinnedMessage } from '../../utils/updatePinnedMessage.js'

dotenv.config({ path: '../.env' })

export const keyboardMyAccount = async (bot, msg, prevMessageForEdit, prevLevel, changeDescription, setPrices) => {
  const t = await ct(msg)
  let accountMessage
  const { id: chatId } = msg.chat
  const msgId = msg.message_id
  const { id } = msg.from

  const { dataValues: { tokens, paid_days } } = await db.subscriber.findOne({
    where: {
      user_id: msg.from.id
    }
  })

  const keys = await createStartKeyboardForReplyMarkup(msg)

  const generalOptions = {
    parse_mode: 'HTML',
    reply_to_message_id: msgId,
    disable_web_page_preview: true
  }
  try {
    const inlineKeyboard = [
      [{ text: t('keyboard_buy_subscription'), callback_data: `buy_subscription_A_${msgId}` }],
      [{ text: t('keyboard_referral'), callback_data: `referral_program_A_${msgId}` }],
      [{ text: t('keyboard_quiz'), callback_data: `keyboard_quiz_A_${msgId}` }]
    ]
    const prevKeyboard = [{ text: t('prev_component'), callback_data: `prev_component_${msgId}` }] // только если prevLevel
    const referralLevel = await referralLevelCreator(msg, generalOptions, msgId, 'my_account')
    const eventEmitter = new events.EventEmitter()

    if (prevLevel)
      inlineKeyboard.push(prevKeyboard)

    const firstLevel = {
      message: null,
      options: {
        ...generalOptions,
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      }
    }

    const buyLevel = {
      message: t('keyboard_tariff'),
      options: {
        ...generalOptions,
        reply_markup: {
          inline_keyboard: [
            [{ text: TARIFS[0].text, callback_data: `${TARIFS[0].callback_data}_A_${msgId}` }],
            [{ text: TARIFS[1].text, callback_data: `${TARIFS[1].callback_data}_A_${msgId}` }],
            [{ text: TARIFS[2].text, callback_data: `${TARIFS[2].callback_data}_A_${msgId}` }],
            [{ text: TARIFS[3].text, callback_data: `${TARIFS[3].callback_data}_A_${msgId}` }],
            [{ text: TARIFS[4].text, callback_data: `${TARIFS[4].callback_data}_A_${msgId}` }],
            [{ text: TARIFS[5].text, callback_data: `${TARIFS[5].callback_data}_A_${msgId}` }],
            [{ text: TARIFS[6].text, callback_data: `${TARIFS[6].callback_data}_A_${msgId}` }],
            [{ text: t('return_to_menu'), callback_data: `get_first_level_A_${msgId}` }]
          ]
        }
      }
    }

    eventEmitter.on(`buy_subscription_A_${msgId}`, async function() {
      await bot.deleteMessage(
        chatId,
        accountMessage.message_id,
      )
        .catch(err => console.log(err))
        .then(async () => {
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

        bot.on('successful_payment', (msg) => {
          const chatId = msg.chat.id;
          bot.sendMessage(chatId, 'Thank you for your purchase!');
        });
    })

    eventEmitter.on(`referral_program_A_${msgId}`, async function() {
      await bot.editMessageText(
        referralLevel.message,
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...referralLevel.options
        }
      ).catch(err => console.log(err))
    })

    eventEmitter.on(`get_first_level_A_${msgId}`, async function() {
      await bot.editMessageText(
        t('account', { tokens: numberWithSpaces(tokens), paid_days }),
        {
          message_id: accountMessage.message_id,
          chat_id: chatId,
          ...firstLevel.options
        }
      ).then(() => updatePinnedMessage(t('keyboard_acc')))
        .catch(err => console.log(err))
    })

    if (prevLevel)
      eventEmitter.on(`prev_component_${msgId}`, function() {
        bot.deleteMessage(chatId, accountMessage?.message_id)
        return prevLevel(bot, msg)
      })

    for (let i = 0; i < TARIFS.length; i++) {
      eventEmitter.on(`${TARIFS[i].callback_data}_A_${msgId}`, async function() {
        const tariff = TARIFS.filter(t => t['callback_data'] === TARIFS[i].callback_data)
        // Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
        const stripe = new Stripe(process.env.STRIPE_API)

        const payok = new PAYOK({
          apiId: process.env.PAYOK_APIID,
          apiKey: process.env.PAYOK_APIKEY,
          secretKey: process.env.PAYOK_SECRETKEY,
          shop: process.env.PAYOK_SHOP
        })

        const valuesOfSuccess = [
          t('html-success:title', { name: createFullName(msg.from) }),
          t('html-success:date-fin'),
          t('html-success:tokens'),
          tariff[0]['text'],
          t('html-success:days', { days: tariff[0]['duration_days'] }),
          t('html-success:btn'),
          tariff[0]['tokens'],
          t('html-success:details-title'),
          t('html-success:details-date')
        ]

        db.payment.create({
          payment_id: nanoid(7),
          type_of_tariff: tariff[0]['text'],
          duration_days: tariff[0]['duration_days'],
          user_id: chatId,
          username: msg.from.username,
          tokens: tariff[0]['tokens'],
          values_of_success: valuesOfSuccess.join('&&')
        }).then(async (invoice) => {

          const paymentLink = await stripe.paymentLinks.create({
            line_items: [
              {
                price: tariff[0]['price_stripe'],
                quantity: 1
              }
            ],
            after_completion: {
              type: 'redirect',
              redirect: {
                url: `http://154.56.63.128:3012/api/subs/payment-success?paymentID=${invoice.dataValues['payment_id']}&userID=${invoice.dataValues['user_id']}&tokens=${invoice.dataValues['tokens']}`
              }
            }
          })

          const link = payok.getPaymentLink({
            amount: tariff[0]['price_payok'],
            payment: invoice.dataValues.payment_id, // TODO: не показывать ID
            desc: tariff[0]['text']
          })

          bot.editMessageText(
            t('dsc:invoice_pay', {name:tariff[0]['text'], id: invoice.dataValues.payment_id}),
            {
              ...generalOptions,
              message_id: accountMessage.message_id,
              chat_id: chatId,
              reply_markup: {
                inline_keyboard: [
                  [{ text: t('btn:stripe'), url: paymentLink.url }],
                  // [{ text: t('btn:payok-rub'), url: link.payUrl }],
                  [{ text: t('return_to_menu'), callback_data: `get_first_level_A_${chatId}` }] // TODO: не работает
                ]
              }
            }).catch(err => console.log(err))
        })
      })
    }

    eventEmitter.on(`keyboard_quiz_A_${msgId}`, async function() {
      eventEmitter.removeAllListeners()
      return keyboardQuiz(bot, msg, true)
    })

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
      eventEmitter.emit(callbackQuery.data)
      bot.answerCallbackQuery(callbackQuery.id, 'my_account', false)
    })

    accountMessage = prevMessageForEdit ?? await bot.sendMessage(
      chatId,
      changeDescription ? '🧃' : '🔐',
      { ...generalOptions, keys }
    ).catch(err => console.log(err))

    const timeout = setTimeout(async (accountMessage) => {
      // TODO: Сделать подсчет колличества бесплатных запросов в сутки на бесплатном режиме
      await db.subscriber.findOne({
        where: {
          chat_id: chatId
        }
      }).then(res => {
        clearTimeout(timeout)

        if (setPrices) {
          bot.editMessageText(
            buyLevel.message,
            {
              message_id: accountMessage.message_id,
              chat_id: chatId,
              ...buyLevel.options
            }
          ).catch(err => console.log(err))
        } else {
          bot.editMessageText(
            changeDescription ? changeDescription : t('account', { tokens: numberWithSpaces(tokens), paid_days }),
            {
              message_id: accountMessage.message_id,
              chat_id: chatId,
              ...firstLevel.options
            }
          ).catch(err => console.log(err))
        }
      })
    }, prevMessageForEdit ? 0 : 1500, accountMessage)
  } catch (error) {
    await bot.sendMessage(chatId, `${error.message}`, generalOptions)
  }
}
