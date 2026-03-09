export function segmentPath(path: string) {
  if (!path || /^[.[\]]/.test(path)) throw Error('invalid path')
  const match = Array.from(path.matchAll(/(?:^|\.)([^.[\]]+)|\[([0-9]*)\]/g))
  let l = 0
  match.forEach((m) => (l += m[0].length))
  if (l !== path.length) throw Error('invalid path')
  return match
}

export function get(src: unknown, path: string): unknown {
  let cur = src
  for (const [, dot, bracket] of segmentPath(path)) {
    const key = dot ?? bracket
    if (typeof cur !== 'object' || cur === null || !(key in cur)) return undefined
    cur = cur[key as keyof typeof cur]
  }
  return cur
}

export function set(src: unknown, path: string, value: unknown) {
  let parent: { [x: string]: unknown } | undefined
  let curKey: string | undefined
  let cur = src
  for (const [, dot, bracket] of segmentPath(path)) {
    // create path recursively
    if (cur === undefined) {
      if (typeof parent !== 'object' || parent === null || curKey === undefined) {
        throw Error('failed to set property on non object type')
      }
      cur = bracket ? [] : {}
      parent[curKey] = cur
    }
    // primitive
    if (typeof cur !== 'object' || cur === null) {
      throw Error('failed to set property on non object type')
    }

    parent = cur as { [x: string]: unknown }
    curKey = dot ?? bracket
    cur = parent[curKey]
  }
  if (parent === undefined || curKey === undefined) throw Error('')
  parent[curKey] = value
}
