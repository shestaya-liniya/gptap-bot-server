export default (sequelize, DataTypes) => {
  const SettingsSchema = sequelize.define('settings', {
    user_id: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      primaryKey: true
    },
    cost_chat: {
      type: DataTypes.DOUBLE,
      required: true
    },
    cost_midjourney: {
      type: DataTypes.DOUBLE,
      required: true
    },
    cost_dalle: {
      type: DataTypes.DOUBLE,
      required: true
    },
    cost_converter: {
      type: DataTypes.DOUBLE,
      required: true
    },
    cost_tts: {
      type: DataTypes.DOUBLE,
      required: true
    },
    m_factor_req: {
       type: DataTypes.DOUBLE,
      required: true
    },
    m_factor_sub: {
       type: DataTypes.DOUBLE,
      required: true
    },
    days_freez: {
       type: DataTypes.DOUBLE,
      defaultValue: 7,
      required: true
    },
  })

  return SettingsSchema
};
