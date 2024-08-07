import { db } from '../../bot/db/index.js'
import { updatePinnedMessage } from '../../bot/utils/updatePinnedMessage.js'

export const allSubs = (req, res) => {
  db.subscriber.findAll({
    limit: 10,
    subQuery: false,
    order: [['createdAt', 'DESC']]
  }).then(subs => {
    res.status(200).send(subs)
  })
}

export const getOneSub = (req, res) => {
  db.subscriber.findOne({
    where: {
      user_id: req.body.user_id
    }
  }).then(sub => {
    res.status(200).send(sub)
  })
}

export const updateSubTokens = (req, res) => {
  console.log(req.body)
  db.subscriber.update({
    tokens: req.body.tokens
  }, {where: {user_id: req.body.user_id}}).then(sub => {
    res.status(200).send(sub)
  })
}

