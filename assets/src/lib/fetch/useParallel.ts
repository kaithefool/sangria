import { type Http } from './useHttp'
import { parallelStates } from './parallel'
import { usePromiseAll } from '../usePromiseAll'

export default function useParallel<T extends unknown[]>(
  ...args: { [I in keyof T]: Http<T[I]> }
) {
  const states = parallelStates<T>(args)
  const promise = usePromiseAll(
    ...(args.map((r) => r.promise) as {
      [I in keyof T]: Http<T[I]>['promise']
    }),
  )
  const fetched = args.reduce<unknown[] | null>((a, c) => {
    if (a === null || c.fetched === null) return null
    return [...a, c.fetched]
  }, []) as T | null

  return {
    ...states,
    fetched,
    promise,
    refresh: () => args.forEach((r) => r.refresh()),
    abort: () => args.forEach((r) => r.abort()),
  }
}
