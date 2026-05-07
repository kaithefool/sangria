import { type ReactNode } from 'react'
import FetchProvider from './FetchProvider'
import { type Http } from './useHttp'
import FetchLoading from './FetchLoading'

function Fetch<T extends unknown>(props: {
  http: Http<T>
  children: (fetched: T) => ReactNode
}): ReactNode
function Fetch<T extends unknown[]>(props: {
  http: { [I in keyof T]: Http<T[I]> }
  children: (...fetched: T) => ReactNode
}): ReactNode
function Fetch<T extends unknown[]>({
  http,
  children,
}: {
  http: { [I in keyof T]: Http<T[I]> } | Http<T>
  children: (...fetched: T) => ReactNode
}) {
  const h = Array.isArray(http)
    ? http
    : ([http] as { [I in keyof T]: Http<T[I]> })

  return (
    <FetchProvider http={h}>
      {(ctx) => (
        <div>
          {ctx.fetched !== null && children(...ctx.fetched)}
          <FetchLoading />
        </div>
      )}
    </FetchProvider>
  )
}

Fetch.Loading = FetchLoading

export default Fetch
