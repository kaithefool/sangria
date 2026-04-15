import type { HttpError, HttpState } from './http'

export type ReadyStates = {
  status: 'ready'
}

export type PendingStates<T extends unknown[] = unknown[]> = {
  status: 'pending'
  codes: (number | undefined)[]
  payloads: { [I in keyof T]?: T[I] }
  progress: number
}

export type ErrorStates = {
  status: 'error'
  errors: HttpError[]
  codes: (number | undefined)[]
  payloads: unknown[]
}

export type SuccessStates<T extends unknown[] = unknown[]> = {
  status: 'success'
  codes: number[]
  payloads: T
  progress: 1
}

export type HttpStates<T extends unknown[] = unknown[]> =
  | ReadyStates
  | PendingStates<T>
  | ErrorStates
  | SuccessStates<T>

export function parallelStates<T extends unknown[] = unknown[]>(
  states: HttpState[],
) {
  let r = { status: 'ready' } as HttpStates<T>

  for (const s of states) {
    if (s.status === 'error') {
      if (r.status !== 'error') {
        r = {
          status: 'error',
          errors: [],
          codes: [],
          payloads: [],
        }
      }
      r.errors.push(s.error)
      r.codes.push(s.code)
      r.payloads.push(s.payload)
    }
    // skip non-error states
    if (r.status === 'error') {
      continue
    }
    if (s.status === 'pending' && r.status !== 'pending') {
      r = {
        status: 'pending',
        codes: [],
        payloads: [],
        progress: 0,
      }
    }

    if (r.status === 'pending') {
      r.status += s.progress / states.length
    }
  }

  return r
}
