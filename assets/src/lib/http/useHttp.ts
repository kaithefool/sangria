import { useEffect, useState, useRef } from 'react'
import { http, HttpPromise, type HttpState, type RequestConfig } from './http'
import { isCancel } from 'axios'

export type UseHttpOpts = {
  logError?: boolean
}

export type Http<T = unknown> = ReturnType<typeof useHttp<T>>

export function useHttp<T>(
  initConfig: RequestConfig | null = null,
  opts?: UseHttpOpts,
) {
  const promise = useRef<HttpPromise<T> | undefined>(undefined)
  const config = useRef(initConfig)
  const [state, setState] = useState<HttpState<T>>({ status: 'ready' })
  const [fetched, setFetched] = useState<T | null>(null)

  const abort = () => promise.current?.abort()
  const request = (c: RequestConfig) => {
    abort()
    config.current = c
    const p = http<T>(c, (s) => {
      setState(s)
      if (s.status === 'success') setFetched(s.payload)
    })
    p.catch((e) => {
      // suppress uncaught error
      if (!isCancel(e) && opts?.logError !== false) {
        console.error(e)
      }
    })
    promise.current = p
  }
  const refresh = () => {
    if (config.current) request(config.current)
  }

  useEffect(() => {
    if (config.current) {
      request(config.current)
    }
    return () => {
      abort()
    }
  }, [])

  return {
    ...state,
    promise: promise.current,
    fetched,
    request,
    refresh,
    abort,
  }
}
