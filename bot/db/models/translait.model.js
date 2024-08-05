export default (sequelize, DataTypes) => {
  const TranslateSchema = sequelize.define("translate", {
    slug: {
      type: DataTypes.STRING
    },
    ru: {
      type: DataTypes.STRING
    },
    en: {
      type: DataTypes.STRING
    },
    fr: {
      type: DataTypes.STRING
    },
    es: {
      type: DataTypes.STRING
    },
  });

  return TranslateSchema;
};
