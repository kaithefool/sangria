import { useHttp, type UseHttpReturn } from './useHttp'
import { parallelStates } from './parallel'

type InferPayloads<T> = {
  [I in keyof T]: T[I] extends UseHttpReturn<infer P> ? P : never
}

export default function useParallel<T extends UseHttpReturn[]>(...rets: T) {
  const states = parallelStates<InferPayloads<T>>(rets)

  return {
    ...states,
    refresh: () => rets.forEach((r) => r.refresh()),
    abort: () => rets.forEach((r) => r.abort()),
  }
}

const p = useParallel(useHttp<{ foo: string }>(), useHttp<{ bar: string }>())
