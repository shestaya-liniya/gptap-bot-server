// TODO: добавить возможность отслеживать есть ли у пользователя запущенные генерации и вообще статус, какой процесс теряется
export default (sequelize, DataTypes) => {
  const MidjourneySchema = sequelize.define('midjourney',
    {
      query_id: {
        type: DataTypes.DOUBLE
      },
      message_id: {
        type: DataTypes.DOUBLE
      },
      chat_instance: {
        type: DataTypes.DOUBLE
      },
      chat_id: {
        type: DataTypes.DOUBLE
      },
      chat_name: {
        type: DataTypes.STRING
      },
      user_id: {
        type: DataTypes.DOUBLE
      },
      username: {
        type: DataTypes.STRING
      },
      data: {
        type: DataTypes.STRING
      },
      prompt: {
        type: DataTypes.STRING
      }
    }
  )
  return MidjourneySchema;
}