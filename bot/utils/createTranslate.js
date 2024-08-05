import translate from 'translate.js'
import { db } from '../db/index.js'

export const ct = async (msg) => {
  const lang = []
  const options = {
    // These are the defaults:
    debug: false,  //[Boolean]: Logs missing translations to console and add "@@" around output, if `true`.
    array: false,  //[Boolean]: Returns translations with placeholder-replacements as Arrays, if `true`.
    resolveAliases: false,  //[Boolean]: Parses all translations for aliases and replaces them, if `true`.
    pluralize: function(n) {
      return Math.abs(n)
    },  //[Function(count)]: Provides a custom pluralization mapping function, should return a string (or number)
    useKeyForMissingTranslation: true //[Boolean]: If there is no translation found for given key, the key is used as translation, when set to false, it returns undefiend in this case
  }

  switch (msg?.from?.language_code) {
    case 'fr':
      return db.fr.findAll().then(async res => {
        await res?.map(({key, value}) => lang[key] = value)
        return translate(lang, [options])
      })
    case 'ru':
      return db.ru.findAll().then(async res => {
        await res?.map(({key, value}) => lang[key] = value)
        return translate(lang, [options])
      })
    default:
      return db.en.findAll().then(async res => {
        await res?.map(({key, value}) => lang[key] = value)
        return translate(lang, [options])
      })
  }
}