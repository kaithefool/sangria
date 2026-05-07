import { useContext } from 'react'
import { FetchContext } from './FetchProvider'

export function useFetch() {
  return useContext(FetchContext)
}
