import { useState } from 'react'
import { HttpState } from './http'

export default function useHttp<T>() {
  const [state, setState] = useState<HttpState<T>>({ status: 'ready' })
  const [fetched, setFetched] = useState<T>()

  return {
    ...state,
    fetched,
  }
}
