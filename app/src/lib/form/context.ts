import { createContext } from 'svelte'
import type { ZodSafeParseResult } from 'zod'

export type Form<T = { [x: string]: unknown }> = {
  data: T
  dirty: Set<string>
  validation?: ZodSafeParseResult<T>
  get: (key: string) => unknown
  set: (key: string, value: unknown) => void
}

export const [getFormContext, setFormContext] = createContext<Form>()
