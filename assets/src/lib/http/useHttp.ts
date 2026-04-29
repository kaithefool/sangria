import { useEffect, useState } from 'react'
import { http, HttpPromise, type HttpState, type RequestConfig } from './http'
import { useEqual } from '../useEqual'
import { isCancel } from 'axios'

export type UseHttpOpts = {
  logError?: boolean
}

export type Http<T = unknown> = ReturnType<typeof useHttp<T>>

export function useHttp<T>(propConfig?: RequestConfig, opts?: UseHttpOpts) {
  const [promise, setPromise] = useState<HttpPromise<T>>()
  const [state, setState] = useState<HttpState<T>>({ status: 'ready' })
  const [fetched, setFetched] = useState<T | null>(null)
  const [reqCount, setReqCount] = useState(0)
  const [localConfig, setLocalConfig] = useState<RequestConfig>()
  const config = localConfig ?? propConfig

  const refresh = () => setReqCount((k) => k + 1)
  const request = (r: RequestConfig) => {
    setLocalConfig(r)
    refresh()
  }
  const abort = () => promise?.abort()

  useEffect(() => {
    let p: HttpPromise<T>
    if (config) {
      p = http<T>(config, (s) => {
        setState(s)
        if (s.status === 'success') setFetched(s.payload)
      })
      p.catch((e) => {
        // suppress uncaught error
        if (!isCancel(e) && opts?.logError !== false) {
          console.error(e)
        }
      })
      setPromise(p)
    }

    return () => {
      p?.abort()
    }
  }, [useEqual(config), reqCount])

  return {
    ...state,
    promise,
    fetched,
    request,
    refresh,
    abort,
  }
}
