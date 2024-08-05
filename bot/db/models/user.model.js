import { BOOLEAN } from 'sequelize/lib/data-types'

export default (sequelize, DataTypes) => {
  const UserSchema = sequelize.define('users',
    {
      telegram_id: {
        type: DataTypes.DOUBLE,
        required: true
      },
      username: {
        type: DataTypes.STRING,
        required: true
      },
      password: {
        type: DataTypes.STRING,
        required: true
      },
      email: {
        type: DataTypes.STRING,
        required: true
      }
    }
  )
  return UserSchema
}