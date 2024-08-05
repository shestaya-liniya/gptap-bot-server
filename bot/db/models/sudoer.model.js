// TODO: Remove this model and transfer items to user schema
export default (sequelize, DataTypes) => {
  const SudoUserSchema = sequelize.define('sudouser',
    {
      userId: {
        type: DataTypes.DOUBLE,
        required: true,
        unique: true
      }
    }
  )
  return SudoUserSchema;
}