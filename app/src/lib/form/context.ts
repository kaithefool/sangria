import { createContext } from 'svelte'

export type Form = {
  data: { [x: string]: any }
}

export default createContext()