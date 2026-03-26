import axios, {
  AxiosError,
  AxiosResponse,
  isAxiosError,
  isCancel,
  type AxiosRequestConfig,
} from 'axios'
import * as qs from 'qs'

export type RequestConfig = {
  file?: File
  progress?: 'upload' | 'download' | boolean
} & AxiosRequestConfig

export type PendingState = {
  status: 'pending'
  progress: number
}

export type ErrorState = {
  status: 'error'
  error: HttpError
  code?: number
  payload?: unknown
}

export type SuccessState = {
  status: 'success'
  code: number
  payload: unknown
  progress: 1
}

export type HttpState = PendingState | ErrorState | SuccessState

export class HttpError {
  message: string
  error: AxiosError
  code?: number
  payload?: unknown

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

export async function httpWithStates<T>(
  request: RequestConfig,
  cb: (r: HttpState) => void = () => {},
): Promise<AxiosResponse<T>> {
  const { progress = false, ...reqConfig } = request
  const config = {
    paramsSerializer: (params: any) =>
      qs.stringify(params, { strictNullHandling: true }),
    timeout: 30 * 1000,
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

  cb({ status: 'pending', progress: 0 })
  try {
    const res = await axios<T>(config)
    cb({
      status: 'success',
      payload: res.data,
      code: res.status,
      progress: 1,
    })
    return res
  } catch (reason) {
    const error = new HttpError(reason)
    cb({
      status: 'error',
      error,
      code: error.code,
      payload: error.payload,
    })
    throw reason
  }
}

export class HttpPromise<T> extends Promise<AxiosResponse<T>> {
  constructor(request: RequestConfig, cb: (r: HttpState) => void = () => {}) {
    if (typeof request === 'function') super(request)
    else {
      const abortCtrl = new AbortController()
      super((resolve) =>
        resolve(
          httpWithStates<T>({ ...request, signal: abortCtrl.signal }, cb),
        ),
      )
      this.abort = () => abortCtrl.abort()
    }
  }

  abort() {}
}

export function http<T = unknown>(
  request: RequestConfig,
  cb: (r: HttpState) => void = () => {},
) {
  return new HttpPromise<T>(request, cb)
}
