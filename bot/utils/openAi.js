import { createReadStream } from 'fs'
import { OpenAI as OpenAIApi } from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { db } from '../db/index.js'

dotenv.config({ path: '../.env' })

const mdReplace = (text, parceMode) => {
  if (parceMode === 'MarkdownV2')
    return text
      .replace(/\_/g, '\\_')
      // .replace(/\*/g, '\\*')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\~/g, '\\~')
      // .replace(/\`/g, '\\`')
      .replace(/\>/g, '\\>')
      .replace(/\#/g, '\\#')
      .replace(/\+/g, '\\+')
      .replace(/\-/g, '\\-')
      .replace(/\=/g, '\\=')
      .replace(/\|/g, '\\|')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\./g, '\\.')
      .replace(/\!/g, '\\!')
  else
    return text
}

export class OpenAI {
  roles = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
  }

  // TODO: BILL: Если куплена подписка и есть доступные запросы из лимитов ставить 4
  // chatGPTVersion = 'gpt-4'


  constructor(filepath) {
    this.openai = new OpenAIApi({
      apiKey: process.env.OPENAI_API_KEY
    })
    this.filepath = filepath
  }

  async chat(messages, bot, editMessage, chatId, parceMode) {
    const { dataValues: { GPT_model } } = await db.subscriber.findOne({
      where: {
        user_id: chatId
      }
    })

    if (!GPT_model)
     return 'Error: 403'

    const response = await this.openai.chat.completions.create({
      model: GPT_model,
      messages,
      stream: true
    })

    let answer = ''
    let prevAnswer = ''
    for await (const chunk of response) {
      answer += chunk.choices[0]?.delta?.content || ''
      process.stdout.write(`${answer.length % process.env.CHAT_GPT_SPEED}`)
      process.stdout.write(`${answer.length === prevAnswer.length ? '🔺' : ''}`)
      if (
        answer.length
        && answer.length !== prevAnswer.length
        && answer.length % process.env.CHAT_GPT_SPEED === 0
      ) {
        // process.stdout.write('🟩')
        await bot.editMessageText(mdReplace(answer, parceMode), {
          message_id: editMessage.message_id,
          chat_id: chatId,
          parse_mode: parceMode
        }).then(() => {
          prevAnswer = answer
        }).catch((err) => {
          console.log('💀 openai.chat', err.message)
          return true
        })
      }
    }

    await bot.editMessageText(mdReplace(answer, parceMode), {
      parse_mode: parceMode,
      message_id: editMessage.message_id,
      chat_id: chatId
    }).catch((err) => {
      console.log('💀 openai.chat', err.message)
    })

    return new Promise(res => res(answer))
  }

  async image(prompt) {
    let response = await this.openai.images.generate({
      prompt,
      model: 'dall-e-3',
      n: 1,
      size: '1024x1024',
      style: 'natural', // "vivid"
      quality: 'hd'
    })
    return response.data[0].url
  }

  async transcription() {
    if (!this.filepath) {
      throw new Error('Something went wrong please try again.')
    }

    const { text } = await this.openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: createReadStream(this.filepath)
    })

    return text
  }

  async textToSpeech(prompt, msg, voice) {
    const imgDir = './text-to-speech';
    const speechFile = path.resolve(`${imgDir}/@${msg.from.username}-${msg.message_id}.mp3`)

    try {
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voice ?? 'nova',
        input: prompt
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speechFile, buffer);

      return speechFile;
    } catch (error) {
      fs.readdir('./', (err, files) => {
        files.forEach(file => {
          console.log(file);
        });
      });
      console.error('Error generating speech file:', error);
      throw error; // Rethrow the error if needed
    }
  }

  async convertFile(msg, file) {
    const documentsDir = './text-to-speech';
    const document = path.resolve(`${documentsDir}/@${msg.from.username}-${msg.message_id}.mp3`)

    try {
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: voice ?? 'nova',
        input: prompt
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.promises.writeFile(speechFile, buffer);

      return speechFile;
    } catch (error) {
      fs.readdir('./', (err, files) => {
        files.forEach(file => {
          console.log(file);
        });
      });
      console.error('Error generating speech file:', error);
      throw error; // Rethrow the error if needed
    }
  }
}
