import type { HttpError, HttpState } from './http'

export type ReadyStates = {
  status: 'ready'
}

export type PendingStates = {
  status: 'pending'
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
  progress: number
}

export type HttpStates<T extends unknown[] = unknown[]> =
  | ReadyStates
  | PendingStates
  | ErrorStates
  | SuccessStates<T>

export function parallelStates<T extends unknown[] = unknown[]>(
  states: HttpState[],
) {
  let r = { status: 'ready' } as HttpStates

  for (const s of states) {
    if (s.status === 'ready') {
      continue
    }
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
      continue
    }
    // skip non-error states if already in error status
    if (r.status === 'error') {
      continue
    }
    if (s.status === 'pending') {
      if (r.status !== 'pending') {
        r = {
          status: 'pending',
          progress: r.status === 'success' ? r.progress : 0,
        }
      }
      r.progress += s.progress / states.length
    }
    if (s.status === 'success') {
      if (r.status === 'ready') {
        r = {
          status: 'success',
          codes: [],
          payloads: [],
          progress: 0,
        }
      }
      r.progress += s.progress / states.length
      if (r.status === 'success') {
        r.codes.push(s.code)
        r.payloads.push(s.payload)
      }
    }
  }

  // float precision problem
  if (r.status === 'success') r.progress = 1

  return r as HttpStates<T>
}
