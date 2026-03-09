function segmentPath(path: string) {
  if (!path || /^[.[\]]/.test(path)) throw Error('invalid path')
  const match = Array.from(path.matchAll(/(?:^|\.)([^.[\]]+)|\[([0-9]+)\]/g))
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

export function set() {}
