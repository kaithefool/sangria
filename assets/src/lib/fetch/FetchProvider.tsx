import { createContext, type ReactNode } from 'react'
import { type Http } from './useHttp'
import useParallel from './useParallel'

export type FetchContextType<T extends unknown[] = unknown[]> = ReturnType<
  typeof useParallel<T>
>

export const FetchContext = createContext<FetchContextType>({
  status: 'ready',
  fetched: null,
  promise: Promise.all([]),
  refresh: () => {},
  abort: () => {},
})

export default function FetchProvider<T extends unknown[]>({
  http,
  children,
}: {
  http: { [I in keyof T]: Http<T[I]> }
  children: ReactNode | ((ctx: FetchContextType<T>) => ReactNode)
}) {
  const value = useParallel<T>(...http)

  return (
    <FetchContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </FetchContext.Provider>
  )
}
