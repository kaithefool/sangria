import { ErrorRequestHandler } from 'express'
import createHttpError, { HttpError } from 'http-errors'

const { NODE_ENV } = process.env

export default function handleErr(
  format: 'html' | 'json' = 'json',
  printErr: boolean = NODE_ENV !== 'production',
): ErrorRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err, req, res, next) => {
    const e = err instanceof HttpError
      ? err
      : createHttpError(500, err)

    res.status(e.status)
    res.locals.error = e
    if (e.status >= 500) {
      console.error(e)
    }
    if (format === 'json') {
      if (printErr) console.error(e)
      return res.json({
        status: e.status,
        message: e.message,
        reason: e.reason,
      })
    }
    return res.render('error')
  }
}
