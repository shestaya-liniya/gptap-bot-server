import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'
import { CHAT_ID, startBot } from './bot/commands/start.js'
import { addSudoer } from './bot/commands/admin/addSudoer.js'
import { removeSudoer } from './bot/commands/admin/removeSudoer.js'
import { listSudoers } from './bot/commands/admin/listSudoers.js'
import { onMessageVoice } from './bot/commands/onMessageVoice.js'
import { getId } from './bot/commands/admin/getId.js'

import { db } from './bot/db/index.js'

import authRoutes from './api/routes/auth.routes.js'
import userRoutes from './api/routes/user.routes.js'
import subsRoutes from './api/routes/subs.routes.js'
import {
  COMMAND_DALL_E,
  COMMAND_GPT,
  COMMAND_MIDJOURNEY,
  REQUEST_TYPES
} from './bot/constants/index.js'
import { keyboardChatGPT } from './bot/commands/keyboard/chat_gpt.js'
import { keyboardMyAccount } from './bot/commands/keyboard/my_account.js'
import { keyboardHelp } from './bot/commands/keyboard/help.js'
import { keyboardMidjourney } from './bot/commands/keyboard/midjourney.js'
import { isModeMidjourney } from './bot/utils/getMode.js'
import { keyboardQuiz } from './bot/commands/keyboard/quiz.js'
import { sendMessage } from './bot/commands/admin/sendMessage.js'
import { switchToMode } from './bot/utils/switchToChatMode.js'
import { keyboardDalle } from './bot/commands/keyboard/dalle.js'

dotenv.config()

import Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { exceptionForHistoryLogging } from './bot/utils/exceptionForHistoryLogging.js'
import { usePromoModel } from './bot/utils/promo/usePromoModel.js'
import { setQuizModeForSubs } from './bot/commands/admin/setQuizModeForSubs.js'
import { midjourneyInfo } from './bot/commands/admin/midjourneyInfo.js'
import { keyboardTextToSpeech } from './bot/commands/keyboard/tts.js'
import { keyboardConverter } from './bot/commands/keyboard/converter.js'
import { createFullName } from './bot/utils/createFullName.js'
import { download, onMessageDocument } from './bot/commands/onMessageDocument.js'
import { ct } from './bot/utils/createTranslate.js'
import { checkTokens } from './bot/utils/checkTokens.js'
import { isTokensEmpty } from './bot/commands/keyboard/empty_tokens.js'
import { refundTokensIfError } from './bot/commands/admin/refundTokensIfError.js'
import { updatePinnedMessage } from './bot/utils/updatePinnedMessage.js'
import OpenAI from "openai";
import fs from 'fs'
import { downAll } from 'docker-compose/dist/v2.js'
import path from 'path'
import { Sequelize } from 'sequelize'
import Config from './bot/utils/config.js'

const { TELEGRAM_API_KEY, SUDO_USER, NODE_REST_PORT, REACT_ADMIN_PORT, PROTOCOL, CORS_HOST } = process.env
const sudoUser = parseInt(SUDO_USER, 10)

export const bot = new TelegramBot(TELEGRAM_API_KEY, { polling: true })

bot.on('polling_error', console.log)

// Use command
startBot(bot)

bot.on('document', async (msg, match) => {
  const {tokensAvailable, price} = await checkTokens(REQUEST_TYPES.CONVERTOR, msg.chat.id)
  if (tokensAvailable <= price)
    return isTokensEmpty(bot, msg, tokensAvailable, price)
  return onMessageDocument(bot, msg)
})

export let originalChatId = null;
bot.on('message', async (msg, match) => {
  const t = await ct(msg)
  originalChatId = msg.chat.id
  if (msg.document) {
    return true
  }

  if (msg?.chat?.type === 'supergroup' || msg.voice) {
    console.log('supergroup?', msg?.chat?.type, msg?.chat)
    return true
  }

  if (msg.text === 'X2PROMO') {
    await usePromoModel(bot, msg.text, msg.chat.id, msg.from)
    return true
  }


  await db.history.create({
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    nickname: msg.chat.username,
    fullname: createFullName(msg.from),
    request: exceptionForHistoryLogging(msg.from.id, msg.text)
  }).catch(async () => {
    await db.history.create({
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      nickname: msg.chat.username,
      fullname: createFullName(msg.from),
      request: 'VERY_LONG_MESSAGE'
    })
  })

  switch (msg.text.trim()) {
    case await t('keyboard_acc').trim():
      switchToMode('GPT', msg.chat.id, msg.from, bot, t('keyboard_acc').trim())
      return keyboardMyAccount(bot, msg)
    case COMMAND_GPT:
      return keyboardChatGPT(bot, msg)
    case t('keyboard_convertor').trim():
      switchToMode('GPT', msg.chat.id, msg.from, bot, t('keyboard_convertor').trim())
      return keyboardConverter(bot, msg)
    case COMMAND_MIDJOURNEY:
      switchToMode('GPT', msg.chat.id, msg.from, bot, COMMAND_MIDJOURNEY)
      return keyboardMidjourney(bot, msg)
    case t('keyboard_tts').trim():
      return keyboardTextToSpeech(bot, msg)
    case COMMAND_DALL_E:
      return keyboardDalle(bot, msg)
    case t('keyboard_help').trim():
      switchToMode('GPT', msg.chat.id, msg.from, bot, t('keyboard_help').trim())
      return keyboardHelp(bot, msg, t)
    case t('keyboard_quiz').trim():
      switchToMode('GPT', msg.chat.id, msg.from, bot, t('keyboard_quiz').trim())
      return keyboardQuiz(bot, msg, true)
    default:
      return isModeMidjourney(bot, msg, match, sudoUser, t)
  }
})

bot.on('successful_payment', async (msg) => {
  const config = Config
  const invoiceId = config.getInvoiceId()

  const chatId = msg.chat.id;
  const tokensPayload = msg.successful_payment.invoice_payload
  config.setInvoiceCanBeCreated(true)

  bot.deleteMessage(chatId, invoiceId)

  await db.subscriber.update(
    {
      tokens: Sequelize.literal(`tokens + ${tokensPayload}`),
    },
    { where: { chat_id: chatId } }
  )
  await bot.sendMessage(chatId, 'Thank you for your purchase 🙌! \n<strong>- GPTap Team</strong>\n \nAnd now go ahead to generate awesome images or talking with chatGPT about philosophy 🥳', {
    parse_mode: "HTML"
  });
  updatePinnedMessage()
});
bot.on('pre_checkout_query', (query) => {
  bot.answerPreCheckoutQuery(query.id, true);
});

onMessageVoice(bot)

// Use admin command
getId(bot)
sendMessage(bot)
midjourneyInfo(bot)
setQuizModeForSubs(bot)
//addSudoer(bot, sudoUser) // TODO: Удалить этот метод и таблицу
//removeSudoer(bot, sudoUser) // TODO: Удалить этот метод и таблицу
//listSudoers(bot, sudoUser) // TODO: Удалить этот метод и таблицу
refundTokensIfError(bot)

const app = express()

Sentry.init({
  dsn: 'https://cd16320a573f069cdc9afe19e324c2cb@o392602.ingest.us.sentry.io/4507084187893760',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    nodeProfilingIntegration()
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0
})

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())
Sentry.setTag('build', process.env.SERVER)


console.log(`${PROTOCOL}://${removeTrailingSlash(CORS_HOST)}`)

app.use(cors({ origin: `${PROTOCOL}://${removeTrailingSlash(CORS_HOST)}` }));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.options('*', cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

authRoutes(app)
userRoutes(app)
subsRoutes(app)

// initial()
function initial() {
  db.role.create({
    id: 1,
    name: 'user'
  })

  db.role.create({
    id: 2,
    name: 'moderator'
  })

  db.role.create({
    id: 3,
    name: 'admin'
  })
}

app.use(Sentry.Handlers.errorHandler())
const port = process.env.PORT || 3000;

// Dump function because of railway adding the slash at the end of origin
function removeTrailingSlash(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

if(process.env.HOSTNAME) {
  app.listen(port, process.env.HOSTNAME, () => console.log(`🟡 REST API is listening on ${process.env.PROTOCOL}://localhost:${process.env.PORT}`))
} else {
  app.listen(port, () => console.log(`🟡 REST API is listening on ${process.env.PROTOCOL}://localhost:${process.env.PORT}`))
}
