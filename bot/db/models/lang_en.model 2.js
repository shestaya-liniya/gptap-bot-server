// TODO: Remove this model and transfer items to user schema
export default (sequelize, DataTypes) => {
  const LangEnSchema = sequelize.define('lang_en',
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
  return LangEnSchema;
}