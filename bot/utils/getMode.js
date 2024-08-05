import { db } from '../db/index.js'
import { modeMidjourney } from '../commands/modes/midjourney.js'
import { onMessageTextDefault } from '../commands/onMessageTextDefault.js'
import { modeDalle } from '../commands/modes/modeDalle.js'
import { textToSpeech } from '../commands/textToSpeech.js'
import { createFullName } from './createFullName.js'
import { checkTokens } from './checkTokens.js'
import { REQUEST_TYPES } from '../constants/index.js'
import { isTokensEmpty } from '../commands/keyboard/empty_tokens.js'
import { switchToMode } from './switchToChatMode.js'

export const isModeMidjourney = async (bot, msg, match, sudoUser, t) => {
  if (msg.text?.match(/^\/+/ig))
    return
  await db.subscriber.findOne({
    where: { chat_id: msg.chat.id, user_id: msg.from.id }
  }).then(async res => {
    const {tokensAvailable, price} = await checkTokens(res.mode, msg.chat.id, msg.text)
    if (tokensAvailable <= price)
      return isTokensEmpty(bot, msg, tokensAvailable, price)

    if (res.mode === REQUEST_TYPES.MIDJOURNEY) {
      return modeMidjourney(bot, sudoUser, msg, match)
    } else if (res.mode === REQUEST_TYPES.DALLE) {
      return modeDalle(bot, sudoUser, msg, match)
    } else if (res.mode === REQUEST_TYPES.TTS) {
      return textToSpeech(bot, msg.chat.id, msg, msg.text, res.tts_voice)
    } else {
      return onMessageTextDefault(bot, msg, match, sudoUser, t)
    }
  }).catch(() => true)
}