import { db } from '../../bot/db/index.js'
import { Sequelize } from 'sequelize'
import { successPage } from '../templates/success-page.js'
import { createDate } from '../utils/create-date.js'
import { sendStarInvoice } from '../../app.js'

export const paymentSuccess = (req, res) => {
  // найти один счет, который якобы оплачен
  db.payment.findOne({
    where: {
      payment_id: req.query?.paymentID,
      user_id: req.query?.userID,
      tokens: req.query?.tokens
    }
  }).then(async invoice => {
    const values = `${invoice['values_of_success']}&&${createDate()}`.split('&&')
    const successTemplate = successPage(values)

    if (invoice['payment_confirmed'])
      return res.status(200).send(successTemplate)

    res.status(200).send(successTemplate)

    await db.payment.update(
      { payment_confirmed: Sequelize.literal('CURRENT_TIMESTAMP') },
      { where: { payment_id: req.query?.paymentID } }
    )

    await db.subscriber.update(
      {
        tokens: Sequelize.literal(`tokens + ${invoice.dataValues['tokens']}`),
        paid_days: invoice.dataValues['duration_days']
      },
      { where: { user_id: invoice.dataValues['user_id'] } }
    )
  })

}

export const paymentWithStars = (req, res) => {
  const tokens = req.body.tokens
  const price = req.body.price

  sendStarInvoice(tokens, price)
}