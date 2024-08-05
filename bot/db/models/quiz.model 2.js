export default (sequelize, DataTypes) => {
  const QuizSchema = sequelize.define('quizs', {
    chat_id: {
      type: DataTypes.DOUBLE
    },
    name: {
      type: DataTypes.STRING
    },
    quiz_res: {
      type: DataTypes.DOUBLE
    },
    dice_res: {
      type: DataTypes.DOUBLE
    }
  })

  return QuizSchema
};
