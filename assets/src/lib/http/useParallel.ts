import { type Http } from './useHttp'
import { parallelStates } from './parallel'
import { usePromiseAll } from '../usePromiseAll'

export default function useParallel<T extends unknown[]>(
  ...rets: { [I in keyof T]: Http<T[I]> }
) {
  const states = parallelStates<T>(rets)
  const promise = usePromiseAll(
    ...(rets.map((r) => r.promise) as {
      [I in keyof T]: Http<T[I]>['promise']
    }),
  )
  const fetched = rets.reduce<unknown[] | null>((a, c) => {
    if (a === null || c.fetched === null) return null
    return [...a, c.fetched]
  }, []) as T | null

  return {
    ...states,
    fetched,
    promise,
    refresh: () => rets.forEach((r) => r.refresh()),
    abort: () => rets.forEach((r) => r.abort()),
  }
}
