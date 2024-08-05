import { db } from '../db/index.js'
import { updatePinnedMessage } from './updatePinnedMessage.js'

export const switchToMode = (mode, chatId, from, bot = null, explicitMode = null) => {
  console.log('switchMode')

  db.subscriber.findOne({
    where: {
      chat_id: chatId,
      user_id: from.id
    }
  }).then(res => {
    if (res?.dataValues.mode === mode)
      return true
    else if (res?.dataValues.mode) {
      db.subscriber.update(
        {
          mode: mode,
          user_id: from.id,
          first_name: from.first_name,
          last_name: from.last_name,
          username: from.username,
          language_code: from.language_code
        },
        { where: { chat_id: chatId } }
      )

    } else {
      db.subscriber.create({
        chat_id: chatId,
        user_id: from.id,
        first_name: from.first_name,
        last_name: from.last_name,
        username: from.username,
        language_code: from.language_code,
        mode: mode
      })
    }
  })
}