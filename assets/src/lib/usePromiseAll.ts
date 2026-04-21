import { useRef } from 'react'

export function areSamePromises(a: Promise<unknown>[], b: Promise<unknown>[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function usePromiseAll<T extends Promise<unknown>[]>(...promises: T) {
  const p = useRef(promises)
  const all = useRef<Promise<{
    -readonly [I in keyof T]: Awaited<T[I]>
  }> | null>(null)

  function getPromiseAll() {
    if (all.current === null || !areSamePromises(p.current, promises)) {
      p.current = promises
      all.current = Promise.all(promises)
    }
    return all.current
  }

  return getPromiseAll()
}
