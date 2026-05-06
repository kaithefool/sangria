import { useContext } from 'react'
import { FetchContext } from './FetchProvider'

export default function useFetch() {
  return useContext(FetchContext)
}
