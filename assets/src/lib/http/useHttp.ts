import { useEffect, useState } from 'react'
import { http, HttpPromise, HttpState, RequestConfig } from './http'
import { useEqual } from './useEqual'

export default function useHttp<T>(propConfig?: RequestConfig) {
  const [promise, setPromise] = useState<HttpPromise<T>>()
  const [state, setState] = useState<HttpState<T>>({ status: 'ready' })
  const [fetched, setFetched] = useState<T>()
  const [reqCount, setReqCount] = useState(0)
  const [localConfig, setLocalConfig] = useState<RequestConfig>()
  const config = localConfig ?? propConfig

  const request = (r: RequestConfig) => {
    setLocalConfig(r)
    setReqCount((k) => k + 1)
  }
  const refresh = () => setReqCount((k) => k + 1)
  const abort = () => promise?.abort()

  useEffect(() => {
    let p: HttpPromise<T>
    if (config) {
      p = http<T>(config, (s) => {
        setState(s)
        if (s.status === 'success') setFetched(s.payload)
      })
      setPromise(p)
    }

    return () => {
      p?.abort()
    }
  }, [useEqual(config), reqCount])

  return {
    promise,
    ...state,
    fetched,
    config,
    request,
    refresh,
    abort,
  }
}
