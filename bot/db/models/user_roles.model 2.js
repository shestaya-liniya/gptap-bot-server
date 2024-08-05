export default (sequelize, DataTypes) => {
  const UserRoles = sequelize.define("user_roles", {
    roleId: {
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER
    }
  });

  return UserRoles;
};