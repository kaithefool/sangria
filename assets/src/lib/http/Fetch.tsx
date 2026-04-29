import type { ReactNode } from 'react'
import type { Http } from './useHttp'
import useParallel from './useParallel'

export default function Fetch<T extends unknown>(props: {
  http: Http<T>
  children: (fetched: T) => ReactNode
}): ReactNode
export default function Fetch<T extends unknown[]>(props: {
  http: { [I in keyof T]: Http<T[I]> }
  children: (...fetched: T) => ReactNode
}): ReactNode
export default function Fetch<T extends unknown[]>({
  http,
  children,
}: {
  http: { [I in keyof T]: Http<T[I]> } | Http<T>
  children: (...fetched: T) => ReactNode
}) {
  const h = Array.isArray(http)
    ? http
    : ([http] as { [I in keyof T]: Http<T[I]> })
  const s = useParallel<T>(...h)

  if (s.fetched !== null) {
    return children(...s.fetched)
  }

  return <></>
}
