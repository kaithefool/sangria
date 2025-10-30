import { RequestHandler, Request, Response } from 'express'

export function unchain(rh: RequestHandler) {
  return async (req: Request, res: Response): Promise<[boolean, unknown]> => {
    let end = true
    let err: unknown
    await rh(req, res, (e) => {
      if (e) err = e
      else end = false
    })
    return [end, err]
  }
}
