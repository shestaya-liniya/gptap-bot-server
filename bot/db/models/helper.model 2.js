export default (sequelize, DataTypes) => {
  const HelperSchema = sequelize.define('helper',
    {
      count: {
        type: DataTypes.DOUBLE
      },
      comment: {
        type: DataTypes.CHAR(255)
      },
    }
  )
  return HelperSchema;
}