import isEqual from 'fast-deep-equal'
import { useRef } from 'react'

export function useEqual(input: unknown) {
  const ref = useRef(input)
  if (!isEqual(ref.current, input)) {
    ref.current = input
  }

  return ref.current
}
