import fs from 'fs'
import path from 'path'
import events from 'events'
import request from 'request'
import fetch from 'node-fetch'
import { spinnerOn } from '../utils/spinner.js'
import { Converter } from '../utils/converter.js'
import { formats, formatsConvertor } from '../constants/formatsConterter.js'
import { stepperOn } from '../utils/stepper.js'
import { sleep } from '../utils/sleep.js'
import { db } from '../db/index.js'
import { Op } from 'sequelize'
import { nanoid } from 'nanoid'
import { ct } from '../utils/createTranslate.js'
import { REQUEST_TYPES } from '../constants/index.js'
import { writingOffTokens } from '../utils/checkTokens.js'

// TODO: определять тип файла от типа в meta telegram

function getPagination(current, formatsArray, msgID) {
  var formats = []
  const formatPages = []

  for (let i = 0; formatsArray.length >= i; i = i + 4) {
    let level = []
    if (formatsArray[i])
      level.push({ text: formatsArray[i], callback_data: `${formatsArray[i]}-${msgID}` })
    if (formatsArray[i + 1])
      level.push({ text: formatsArray[i + 1], callback_data: `${formatsArray[i + 1]}-${msgID}` })
    if (formatsArray[i + 2])
      level.push({ text: formatsArray[i + 2], callback_data: `${formatsArray[i + 2]}-${msgID}` })
    if (formatsArray[i + 3])
      level.push({ text: formatsArray[i + 3], callback_data: `${formatsArray[i + 3]}-${msgID}` })
    formats.push(level)
  }

  for (let i = 0; formats.length >= i; i = i + 4) {
    if (formats[i])
      formatPages.push([formats[i], formats[i + 1], formats[i + 2], formats[i + 3]])
  }

  const keys = []
  if (current > 1) keys.push({ text: `«1`, callback_data: '1' })
  if (current > 2) keys.push({ text: `‹${current - 1}`, callback_data: (current - 1).toString() })
  // keys.push({ text: `-${current}-`, callback_data: current.toString() })
  if (current < formatPages.length - 1) keys.push({ text: `${current + 1}›`, callback_data: (current + 1).toString() })
  if (current < formatPages.length) keys.push({
    text: `${formatPages.length}»`,
    callback_data: formatPages.length.toString()
  })

  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [...formatPages[current - 1], keys]
    })
  }
}

export const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback)
  })
}

export const onMessageDocument = async (bot, msg) => {
  const t = await ct(msg)
  const options = { parse_mode: 'HTML', reply_to_message_id: msg.message_id }
  const converter = new Converter()
  // const formats = await converter.getSupportedConversionTypes()
  let spinner = await spinnerOn(bot, msg.chat.id, null, 'document')
  const fileId = msg.document.file_id
  const fileType = msg.document['file_name'].split('.')
  const type = fileType[fileType.length - 1]
  console.log('type', type)
  let typesForConverter = formats.find(i => i.sourceFormat === type)

  const isATaskAtWork = await db.convertor_requests.findOne({
    where: {
      chat_id: msg.chat.id,
      [Op.or]: [{ status: 'work' }, { status: 'suspense' }]
    }
  })

  /*if (isATaskAtWork) {
    const { file_name, format_from, format_to, status } = isATaskAtWork.dataValues
    console.log('isATaskAtWork', isATaskAtWork)
    await bot.deleteMessage(msg.chat.id, spinner)
    return bot.sendMessage(
      msg.chat.id,
      t('msg:cnvrt:prev-task-is-work', { file_name, format_from, format_to, status }),
      options
    )
  }*/

  if (!typesForConverter) {
    await bot.deleteMessage(msg.chat.id, spinner)
    await bot.sendMessage(msg.chat.id, t('msg:cnvrt:bad-file-format'), options)
    return true
  }

  let result = typesForConverter.targetFormats.filter((arr) => formatsConvertor.includes(arr))

  await bot.sendMessage(msg.chat.id, t('msg:cnvtr:select-format'), {
    ...getPagination(1, result, msg.chat.id)
  }).then(() => bot.deleteMessage(msg.chat.id, spinner).catch())
    .catch(() => bot.deleteMessage(msg.chat.id, spinner).catch())

  const eventEmitter = new events.EventEmitter()

  for (let i = 0; result.length > i; i++) {
    eventEmitter.on(`${result[i]}-${msg.from.id}`, async function(msg) {
      if (msg.data.includes(msg.from.id)) {

        const fileType = msg.document['file_name'].split('.')
        const type = fileType[fileType.length - 1]
        const name = fileType.map(i => i !== type ? i : '') // добавить алгоритм который будет убирать тоьлко последнюю точку

        const { dataValues: settings } = await db.settings.findOne({ where: { user_id: 0 } })

        const createTask = await db.convertor_requests.create({
          document_id: nanoid(10),
          chat_id: msg.from.id,
          message_id: msg.message.message_id, // я его удаляю ниже, это точно нужно?
          status: 'work',
          file_name: name.join(''),
          format_from: type,
          format_to: msg.data.split('-')[0],
          price_tokens: settings['cost_converter']
        })
        if(msg.from) {
          await writingOffTokens(bot, msg, REQUEST_TYPES.CONVERTOR)
        }

        await bot.deleteMessage(msg.from.id, msg.message.message_id).catch((error) => console.log('error dm', error))
        const waiting = await stepperOn(bot, msg, 0) // верочтно логичнее будет сохранить прошлое сообщение msg.message.message_id
        const resFile = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/getFile?file_id=${fileId}`)
        const res2 = await resFile.json()
        const filePath = res2.result.file_path
        const fileName = filePath.split('/')[1]
        const downloadURL = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_KEY}/${filePath}`
        download(downloadURL, path.join('conversions', fileName), async () => {
          console.log('🟩Done!', msg)
          bot.sendMessage(process.env.NOTIF_GROUP, `⚙️ ${msg.from.first_name} converts file from ${type} to ${msg.data.split('-')[0]}`).catch()
          await stepperOn(bot, msg, 1, waiting)
          await converter.getUpload(`conversions/${fileName}`)
            .then(async res => {
              await stepperOn(bot, msg, 2, waiting)
              await sleep(3000)
              const newFile = await converter.getConverter(
                `conversions/${fileName}`,
                msg.data.split('-')[0], // формат в который производим конвертацию
                bot,
                msg
              )

              if (newFile) {
                // тут нужно создать строку с новым именем файла с форматом в который производим конвертацию
                const newFileName = `${createTask.dataValues['file_name']}.${createTask.dataValues['format_to']}`
                const taskID = createTask.dataValues['document_id']
                await stepperOn(bot, msg, 3, waiting)
                await converter.getDownload(newFile[0].path, newFile[0].name, msg.from.id, bot, waiting?.message_id, newFileName, taskID)
              }
            })
        })

        return true
      }
    })
  }

  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    callbackQuery.document = msg.document
    eventEmitter.emit(callbackQuery.data, callbackQuery)
    bot.answerCallbackQuery(callbackQuery.id, 'on_message_document', false)

    if (!callbackQuery.data.includes(msg.from.id) && callbackQuery.data.length <= 2) {
      const editOptions = Object.assign({}, getPagination(parseInt(callbackQuery.data), result, msg.from.id), {
        chat_id: msg.from.id,
        message_id: callbackQuery.message.message_id
      })
      bot.editMessageText(t('msg:cnvtr:select-format'), editOptions)
    } else {
      eventEmitter.removeAllListeners()
    }
  })

  // await bot.deleteMessage(msg.chat.id, waiting)
  return true
}