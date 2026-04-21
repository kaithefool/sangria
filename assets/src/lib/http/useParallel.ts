import { type UseHttpReturn } from './useHttp'
import { parallelStates } from './parallel'
import { usePromiseAll } from '../usePromiseAll'

type InferPayloads<T> = {
  [I in keyof T]: T[I] extends UseHttpReturn<infer P> ? P : never
}

type InferPromises<T> = {
  [I in keyof T]: T[I] extends UseHttpReturn
    ? Exclude<T[I]['promise'], undefined>
    : never
}

export default function useParallel<T extends UseHttpReturn[]>(...rets: T) {
  const states = parallelStates<InferPayloads<T>>(rets)
  const promise = usePromiseAll(
    ...(rets.map((r) => r.promise) as InferPromises<T>),
  )

  return {
    ...states,
    promise,
    promises: rets.map((r) => r.promise) as InferPromises<T>,
    refresh: () => rets.forEach((r) => r.refresh()),
    abort: () => rets.forEach((r) => r.abort()),
  }
}
