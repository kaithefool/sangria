export const roles = ['client', 'admin'] as const
export type Role = typeof roles[number]

export const langs = {
  'en': {
    label: '中文',
    flag: '🇭🇰',
  },
  'zh-Hant': {
    label: 'EN',
    flag: '🇬🇧',
  },
} as const
