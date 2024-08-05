import { DataTypes, Sequelize } from 'sequelize'
import MidjourneySchema from './models/midjourney.model.js'
import UserSchema from './models/user.model.js'
import SubscriberSchema from './models/subscriber.model.js'
import PaymentSchema from './models/payment.model.js'
import RoleSchema from './models/role.model.js'
import UserRolesSchema from './models/user_roles.model.js'
import SudoUserSchema from './models/sudoer.model.js'
import QuizSchema from './models/quiz.model.js'
import HistorySchema from './models/history.model.js'
import TranslateSchema from './models/translait.model.js'
import LangRuSchema from './models/lang_ru.model.js'
import LangFrSchema from './models/lang_fr.model.js'
import LangEnSchema from './models/lang_en.model.js'
import SettingsSchema from './models/settings.model.js'
import Chatgpt3RequestsSchema from './models/chatgpt3_requests.model.js'
import ConvertorRequestsSchema from './models/convertor_requests.model.js'
import { dbConfig } from './db.config.js'
import HelperModel from './models/helper.model.js'

const DATABASE_URL = process.env.DATABASE_URL
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'mysql',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true
  },
  logging: false,
  pool: {
    max: dbConfig?.pool?.max || 5,
    min: dbConfig?.pool?.min || 0,
    acquire: dbConfig?.pool?.acquire || 30000,
    idle: dbConfig?.pool?.idle || 10000
  }
});

export const db = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = UserSchema(sequelize, DataTypes)
db.role = RoleSchema(sequelize, DataTypes)
db.midjourney = MidjourneySchema(sequelize, DataTypes)
db.subscriber = SubscriberSchema(sequelize, DataTypes)
db.userRoles = UserRolesSchema(sequelize, DataTypes)
db.sudouser = SudoUserSchema(sequelize, DataTypes)
db.payment = PaymentSchema(sequelize, DataTypes)
db.quiz = QuizSchema(sequelize, DataTypes)
db.history = HistorySchema(sequelize, DataTypes)
db.translate = TranslateSchema(sequelize, DataTypes)
db.helper = HelperModel(sequelize, DataTypes)
db.ru = LangRuSchema(sequelize, DataTypes)
db.fr = LangFrSchema(sequelize, DataTypes)
db.en = LangEnSchema(sequelize, DataTypes)
db.settings = SettingsSchema(sequelize, DataTypes)
db.chat3_requests = Chatgpt3RequestsSchema(sequelize, DataTypes)
db.convertor_requests = ConvertorRequestsSchema(sequelize, DataTypes)

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});

db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

db.ROLES = ['user', 'admin', 'moderator']

sequelize.sync().then(() => {
  console.log(`🟢 ${dbConfig.HOST}:${dbConfig.port} – sequelize.sync successfully!`)
}).catch((error) => {
  console.error('AAAAAA Unable to create table : ', error)
})