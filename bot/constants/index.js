export const INITIAL_SESSION = {
  messages: []
}

export const TYPE_RESPONSE_MJ = {
  PHOTO: 'PHOTO',
  DOCUMENT: 'DOCUMENT'
}
// TODO: сделать акцент для удобства людей с ограниченными возможностями. TTS STT
export const COMMAND_GPT = '🤖 ChatGPT'
export const COMMAND_DALL_E = '🎨️ DALL-E'


export const COMMAND_MIDJOURNEY = '🏞 Midjourney'

export const TARIFS = [
  {
    tokens: 10000,
    text: '10.000 🍪 for 7 days',
    callback_data: 'DAYS_7_10000',
    duration_days: 7,
    price_stripe: 'price_1PDV8G033yepPfsGBNvZ6XRr',
    price_payok: '69'
  },
  {
    tokens: 30000,
    text: '30.000 🍪 for 7 days',
    callback_data: 'DAYS_7_30000',
    duration_days: 7,
    price_stripe: 'price_1PDWkC033yepPfsGETJ8sEey',
    price_payok: '199'
  },
  {
    tokens: 150000,
    text: '150.000 🍪 for 1 month',
    callback_data: 'DAYS_30_150000',
    duration_days: 30,
    price_stripe: 'price_1PDWlg033yepPfsGa4W2wSIP',
    price_payok: '499'
  },
  {
    tokens: 620000,
    text: '620.000 🍪 for 6 month',
    callback_data: 'DAYS_30_620000',
    duration_days: 180,
    price_stripe: 'price_1PDWoJ033yepPfsGDhkbouQB',
    price_payok: '1900'
  },
  {
    tokens: 2000000,
    text: '2.000.000 🍪 for 1 year',
    callback_data: 'DAYS_365_2000000',
    duration_days: 365,
    price_stripe: 'price_1PDWrA033yepPfsGtHlwFzqC',
    price_payok: '4700'
  },
  {
    tokens: 4200000,
    text: '4.200.000 🍪 for 1 year',
    callback_data: 'DAYS_365_4200000',
    duration_days: 365,
    price_stripe: 'price_1PDWt8033yepPfsGETZl0hzT',
    price_payok: '9300'
  },
  {
    tokens: 10000000,
    text: '10.000.000 🍪 for 1 year',
    callback_data: 'DAYS_365_10000000',
    duration_days: 365,
    price_stripe: 'price_1PDWuB033yepPfsGsRmon1WR',
    price_payok: '20000'
  }
]

export const VOICES = [
  { text: 'Alloy', callback_data: 'alloy' },
  { text: 'Echo', callback_data: 'echo' },
  { text: 'Fable', callback_data: 'fable' },
  { text: 'Onyx', callback_data: 'onyx' },
  { text: 'Nova', callback_data: 'nova' },
  { text: 'Shimmer', callback_data: 'shimmer' }
]

export const REQUEST_TYPES = {
  GPT: 'GPT',
  MIDJOURNEY: 'MIDJOURNEY',
  DALLE: 'DALLE',
  TTS: 'TTS',
  CONVERTOR: 'CONVERTOR'
}

export const REQUEST_TYPES_COST = {
  GPT: 'cost_chat',
  TTS: 'cost_tts',
  MIDJOURNEY: 'cost_midjourney',
  DALLE: 'cost_dalle',
  CONVERTOR: 'cost_converter'
}
