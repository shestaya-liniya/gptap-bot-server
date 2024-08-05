export default (sequelize, DataTypes) => {
  const ConvertorSchema = sequelize.define('convertor_requests',
    {
      document_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      chat_id: {
        type: DataTypes.DOUBLE,
        required: true,
      },
      message_id: {
        type: DataTypes.DOUBLE,
        required: true
      },
      status: {
        type: DataTypes.STRING,
        required: true,
        defaultValue: 'suspense' // suspense, work, error, cancel, done
      },
      file_name: {
        type: DataTypes.TEXT // data for resend request if error or restart server
      },
      format_from: {
        type: DataTypes.STRING
      },
      format_to: {
        type: DataTypes.STRING
      },
      price_tokens: {
        type: DataTypes.DOUBLE, // 0 - no, 1 - yes
      }
    }
  )
  return ConvertorSchema;
}