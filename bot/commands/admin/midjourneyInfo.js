import { Midjourney } from 'midjourney'
import Converter from 'timestamp-conv'

export const midjourneyInfo = async (bot) => {
  bot.onText(/^\/minfo+/ig, async msg => {
    if (msg?.chat?.id == process.env.NOTIF_GROUP) {
      const { id: chatId } = msg.chat
      const options = {
        parse_mode: 'HTML'
      }

      try {
        const { SERVER_ID, CHANNEL_ID, SALAI_TOKEN } = process.env
        console.log(SERVER_ID, CHANNEL_ID, SALAI_TOKEN)
        const client = new Midjourney({
          ServerId: SERVER_ID,
          ChannelId: CHANNEL_ID,
          SalaiToken: SALAI_TOKEN,
          Debug: true,
          Ws: true
        })

        const msg = await client.Info()

        const date = new Converter.date(+msg.subscription.split('<t:')[1].substring(0, 10))

        const message = `
👨🏻‍🎨 <b>Midjourney Info </b>
Basic (Active monthly). 
Renews next on ${date.getDay()}.${date.getMonth()}.${date.getYear()}, ${date.getHour()}:${date.getMinute()}
${msg.fastTimeRemaining}
visibilityMode: ${msg.visibilityMode}
lifetimeUsage: ${msg.lifetimeUsage}
relaxedUsage: ${msg.relaxedUsage}
queuedJobsFast: ${msg.queuedJobsFast}
queuedJobsRelax: ${msg.queuedJobsRelax}
runningJobs: ${msg.runningJobs}
jobMode: ${msg.jobMode} 
  `
        await bot.sendMessage(chatId, message, options)
      } catch (error) {
        console.log('catch')
        await bot.sendMessage(chatId, `${error.message}`, options)
      }
    }
  })
}
