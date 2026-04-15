import { useMemo } from 'react'
import { useHttp, type UseHttpReturn } from './useHttp'
import type { HttpState } from './http'

type InferPayloads<T> = {
  [I in keyof T]: T[I] extends UseHttpReturn<infer P> ? P : never
}

export default function useParallel<T extends UseHttpReturn[]>(...rets: T) {
  return {
    refresh: () => rets.forEach((r) => r.refresh()),
    abort: () => rets.forEach((r) => r.abort()),
  }
}
