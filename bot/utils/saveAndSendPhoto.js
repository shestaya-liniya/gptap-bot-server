import fs from 'fs'
import axios from 'axios'
import { TYPE_RESPONSE_MJ } from '../constants/index.js'
import { createProgress } from './loader.js'
import { db } from '../db/index.js'

export const saveAndSendPhoto = async (
  imgUrl,
  imgDir,
  filePath,
  chatID,
  bot,
  options,
  typeResponse,
  loadingMessage
) => {
  try {
    let prevMessageId
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir)
    }
    await axios
      .get(imgUrl, { responseType: 'arraybuffer' })
      .then(async response => {
        fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'))
        const stream = fs.createReadStream(filePath)

        if (typeResponse === TYPE_RESPONSE_MJ.PHOTO) {
          prevMessageId = await bot.sendPhoto(chatID, stream, options)
          await bot.deleteMessage(chatID, loadingMessage?.message_id)
        } else if (typeResponse === TYPE_RESPONSE_MJ.DOCUMENT) {
          prevMessageId = await bot.sendDocument(chatID, stream, options)
          await bot.deleteMessage(chatID, loadingMessage?.message_id)
        }
      })
      .catch(error => {
        console.error(error)
      })
    return prevMessageId
  } catch (error) {
    console.log(error)
  }
}

export const saveAndSendPreloaderPhoto = async (
  imgUrl,
  chatID,
  bot,
  prev,
  progress
) => {
  const imgDir = './loading_upscales'
  const filePath = `${imgDir}/${imgUrl.substr(-7)}.png`
  let photo
  try {
    if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir)
    }
    await axios
      .get(imgUrl, { responseType: 'arraybuffer' })
      .then(async response => {
        fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'))
        const stream = fs.createReadStream(filePath)
        if (prev) {
          await bot.deleteMessage(chatID, prev).catch(() => {
            console.log('🔺 general | error remove loader ', prev)
          })
          photo = await bot.sendPhoto(chatID, stream, {
            caption: createProgress(progress?.replace('%', ''))
          })
        }
      })
      .catch(error => {
        console.error(error)
      })
    return photo
  } catch (error) {
    console.log(error)
  }
}

export const saveAndSendConvertedDocument = async (
  filename,
  buffer,
  chatID,
  bot,
  prev,
  resFileName,
  taskID
) => {
  const docDir = './converted'
  const filePath = `${docDir}/${filename}`
  const newPath = `${docDir}/${resFileName}`
  let file
  try {
    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir)
    }

    fs.writeFileSync(filePath, Buffer.from(buffer, 'binary'))
    fs.renameSync(filePath, newPath)
    const stream = fs.createReadStream(newPath)

    file = await bot.sendDocument(chatID, stream, {
      // caption: createProgress(progress?.replace('%', ''))
    }).then(async () => {
      await bot.deleteMessage(chatID, prev).catch(() => {
        console.log('🔺 general | error remove loader ', prev)
      })
      await db.convertor_requests.update(
        { status: 'done' },
        { where: { document_id: taskID } }
      )
    })
    return file
  } catch (error) {
    console.log(error)
    await db.convertor_requests.update(
      { status: 'error' },
      { where: { document_id: taskID } }
    )
  }
}