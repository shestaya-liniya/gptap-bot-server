// TODO: Remove this model and transfer items to user schema
export default (sequelize, DataTypes) => {
  const LangFrSchema = sequelize.define('lang_fr',
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
  return LangFrSchema;
}