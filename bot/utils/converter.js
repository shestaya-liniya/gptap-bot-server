import dotenv from 'dotenv'
import {
  GetSupportedConversionTypesRequest,
  InfoApi,
  FileApi,
  ConvertApi,
  ConvertSettings,
  ConvertDocumentRequest,
  UploadFileRequest,
  DownloadFileRequest
} from 'groupdocs-conversion-cloud'
import { saveAndSendConvertedDocument } from './saveAndSendPhoto.js'
import fs from 'fs'
import { errorMessage } from '../commands/hoc/errorMessage.js'
import { db } from '../db/index.js'

dotenv.config({ path: '../../../.env' })

export class Converter {
  constructor(filepath) {
    this.api = InfoApi.fromKeys(process.env.CONVERTER_SID, process.env.CONVERTER_KEY)
    this.apiConvert = ConvertApi.fromKeys(process.env.CONVERTER_SID, process.env.CONVERTER_KEY)    // this.filepath = filepath
    this.apiFile = FileApi.fromKeys(process.env.CONVERTER_SID, process.env.CONVERTER_KEY)
  }

  async getSupportedConversionTypes() {
    const request = new GetSupportedConversionTypesRequest()
    let formats = []
    return this.api.getSupportedConversionTypes(request)
      .then((result) => {
        formats = result
        console.log('Supported file-formats:')
        result.forEach((format) => {
          console.log(format.sourceFormat + ': [' + format.targetFormats.join(', ') + ']')
        })
        return formats
      })
  }

  async getConverter(filePath, format, bot, msg) {
    let settings = new ConvertSettings()
    settings.filePath = filePath
    settings.format = format
    settings.outputPath = 'converted'

    return await this.apiConvert.convertDocument(new ConvertDocumentRequest(settings)).then(res => {
      console.log('res', res)
      return res
    }).catch(err => {
      errorMessage(bot, err, msg, 'convertor')
      return console.log('err', err)
    })
  }

  async getDownload(filePath, fileName, chatID, bot, waitingID, resFileName, taskID) {
    let res = new DownloadFileRequest(filePath)
    await this.apiFile.downloadFile(res)
      .then(function(response) {
        console.log('Expected response type is Stream: ' + response.length)
        return saveAndSendConvertedDocument(fileName, response, chatID, bot, waitingID, resFileName, taskID)
      })
      .catch(function(error) {
        console.log('Error: ' + error.message)

        db.convertor_requests.update(
        { status: 'error' },
        { where: { document_id: taskID } }
      )
      })
  }

  async getUpload(resourcesFolder) {
    // const resourcesFolder = 'conversions/caf.pdf'
    fs.readFile(resourcesFolder, (err, fileStream) => {
      const request = new UploadFileRequest(resourcesFolder, fileStream)
      this.apiFile.uploadFile(request)
        .then(function(response) {
          console.log('🟩Expected response type is FilesUploadResult: ' + response.uploaded.length)
        })
        .catch(function(error) {
          console.log('Error: ' + error.message)
        })
    })
  }
}
