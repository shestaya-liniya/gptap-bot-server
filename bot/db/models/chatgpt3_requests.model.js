export default (sequelize, DataTypes) => {
  const Chatgpt3RequestsSchema = sequelize.define('chatgpt3_requests',
    {
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
      context: {
        type: DataTypes.TEXT // data for resend request if error or restart server
      },
      priority: {
        type: DataTypes.DOUBLE, // 0 - no, 1 - yes
      }
    }
  )
  return Chatgpt3RequestsSchema;
}