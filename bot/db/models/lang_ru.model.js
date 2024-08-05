// TODO: Remove this model and transfer items to user schema
export default (sequelize, DataTypes) => {
  const LangRuSchema = sequelize.define('lang_ru',
    {
      key: {
        type: DataTypes.STRING,
        primaryKey: true,
        required: true,
        unique: true
      },
      value: {
        type: DataTypes.TEXT,
      }
    }
  )
  return LangRuSchema;
}