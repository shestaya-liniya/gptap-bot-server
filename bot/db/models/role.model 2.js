export default (sequelize, DataTypes) => {
  const RoleSchema = sequelize.define("roles", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    }
  });

  return RoleSchema;
};
