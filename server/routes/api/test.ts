export const apiRoot =
  process.argv.filter((a) => a.match(/^--api=/))[0]?.replace('--api=', '') ??
  'http://localhost:3000/api'
