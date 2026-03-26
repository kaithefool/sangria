import axios, {
  AxiosError,
  isAxiosError,
  isCancel,
  type AxiosRequestConfig,
} from 'axios'
import qs from 'qs'

export type RequestConfig = {
  file?: File
  progress?: 'upload' | 'download' | boolean
} & AxiosRequestConfig

export type PendingResponse = {
  status: 'pending'
  progress: number
}

export type ErrorResponse = {
  status: 'error'
  error: HttpError
  code?: number
  payload?: unknown
}

export type SuccessResponse = {
  status: 'success'
  code: number
  payload: unknown
  progress: 1
}

export type Response = PendingResponse | ErrorResponse | SuccessResponse

export class HttpError {
  message: string
  code?: number
  payload?: unknown
  error: AxiosError

  constructor(reason: unknown) {
    if (isAxiosError(reason)) {
      this.error = reason
      if (isCancel(reason)) {
        this.message = 'aborted'
      } else if (reason.message === 'Network Error') {
        this.message = 'network'
      } else if (reason.code === 'ECONNABORTED') {
        this.message = 'timeout'
      } else if (reason.response) {
        this.message = reason.response.statusText
        this.code = reason.response.status
        this.payload = reason.response.data
      } else {
        throw reason
      }
    } else {
      throw reason
    }
  }
}

export function http(
  request: RequestConfig,
  cb: (r: Response) => void = () => {},
) {
  const { progress = false, ...reqConfig } = request
  const abortCtrl = new AbortController()
  const abort = () => abortCtrl.abort()
  const config = {
    paramsSerializer: (params: any) =>
      qs.stringify(params, { strictNullHandling: true }),
    timeout: 30 * 1000,
    signal: abortCtrl.signal,
    ...reqConfig,
  }

  if (progress === 'upload' || progress === true) {
    config.onUploadProgress = (evt) => {
      if (reqConfig.onUploadProgress) reqConfig.onUploadProgress(evt)
      if (evt.total) {
        cb({ status: 'pending', progress: evt.loaded / evt.total })
      }
    }
  }
  if (progress === 'download' || progress === true) {
    config.onDownloadProgress = (evt) => {
      if (reqConfig.onDownloadProgress) reqConfig.onDownloadProgress(evt)
      if (evt.total) {
        cb({ status: 'pending', progress: evt.loaded / evt.total })
      }
    }
  }

  const promise = (async () => {
    cb({ status: 'pending', progress: 0 })
    try {
      const res = await axios(config)
      cb({
        status: 'success',
        payload: res.data,
        code: res.status,
        progress: 1,
      })
    } catch (reason) {
      const error = new HttpError(reason)
      cb({
        status: 'error',
        error,
        code: error.code,
        payload: error.payload,
      })
    }
  })()

  return { ...promise, abort }
}
