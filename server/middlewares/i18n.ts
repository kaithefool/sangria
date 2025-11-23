import i18next from 'i18next'
import { handle, LanguageDetector } from 'i18next-http-middleware'
import { langs } from '../consts'
import en from '../locales/en.json'
import zhHant from '../locales/zh-hant.json'
import { Request } from 'express'

i18next
  .use(LanguageDetector)
  .init({
    cleanCode: true,
    supportedLngs: Object.keys(langs),
    fallbackLng: Object.keys(langs)[0],
    resources: {
      'en': { translation: en },
      'zh-Hant': { translation: zhHant },
    },
  })

export function getI18n(req: Request) {
  if (req.i18n === undefined) throw new Error('i18n not found')
  return req.i18n
}

export default handle(i18next)
