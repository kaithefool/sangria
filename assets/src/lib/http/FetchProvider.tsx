import { createContext, type ReactNode } from 'react'

export type FetchContextType = {
  refresh: () => void
  abort: () => void
}

export const FetchContext = createContext<FetchContextType>({
  refresh: () => {},
  abort: () => {},
})

export default function FetchProvider({
  children,
}: {
  children: ReactNode | ((v: FetchContextType) => ReactNode)
}) {
  const value: FetchContextType = {}

  return (
    <FetchContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </FetchContext.Provider>
  )
}
