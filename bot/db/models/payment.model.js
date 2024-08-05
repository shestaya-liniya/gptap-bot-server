import { BOOLEAN } from 'sequelize/lib/data-types'

// Реферальные ссылки нужно учитывать как платежи без оплаты с определенным типом

export default (sequelize, DataTypes) => {
  const PaymentSchema = sequelize.define('payments',
    {
      payment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      payment_confirmed: { // DATE
        allowNull: true,
        type: DataTypes.DATE,
      },
      type_of_tariff: { // страка названия при выставлении счёта
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration_days: { // "7" "30" "365"
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      tokens: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      price: { // 199 (сумма проведенная через stripe)
        type: DataTypes.STRING
      },
      currency: { // "RUB" "EUR" (строка валюты платежа)
        type: DataTypes.STRING
      },
      user_id: { // кому принадлежит подписка
        type: DataTypes.DOUBLE,
        required: true,
      },
      username: { // кому принадлежит подписка
        type: DataTypes.STRING,
        allowNull: true,
      },
      values_of_success: { // строка для формирования страницы успешной оплаты
        type: DataTypes.TEXT,
      }
    }
  )
  return PaymentSchema
}