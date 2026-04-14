import { useMemo } from 'react'
import { useHttp, type UseHttpReturn } from './useHttp'
import type { HttpState } from './http'

type InferPayloads<T> = {
  [I in keyof T]: T[I] extends UseHttpReturn<infer P> ? P : never
}

export default function useParallel<T extends UseHttpReturn[]>(...rets: T) {
  let state = { status: 'ready' } as HttpState

  for (const r of rets) {
    if (r.status === 'error') {
      state = {
        status: 'error',
        error: r.error,
        code: r.code,
        payload: r.payload,
      }
      break
    } else if (r.status === 'pending') {
      let progress = r.progress / rets.length
      if (state.status === 'pending' || state.status === 'success') {
        progress += state.progress
      }
      state = { status: 'pending', progress }
    } else if (r.status === 'success' && state.status !== 'pending') {
      state = {
        status: 'success',
        code: r.code,
        payload: [...state.payload, r.payload],
        progress: 1,
      }
    }
  }

  return {
    refresh: () => rets.forEach((r) => r.refresh()),
    abort: () => rets.forEach((r) => r.abort()),
  }
}
