import { RequestHandler, Request, Response } from 'express'

/**
 * A wrapper func to turn any middleware into a simple async func
 * that return if there is an error
 * and if it has signified the end of the response
 */
export function unchain(rh: RequestHandler) {
  return async (req: Request, res: Response): Promise<{
    err: unknown
    end: boolean
  }> => {
    let err: unknown = undefined
    let end = true
    await rh(req, res, (e) => {
      if (e) err = e
      else end = false
    })
    return { err, end }
  }
}
