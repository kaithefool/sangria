export function segmentPath(path: string) {
  return path.matchAll(/(?:^|\.)([^.[]]*)|\[([0-9]*)\]/g)
}

export function get(src: unknown, path: string): unknown {
  let cur = src
  for (const [, dot, bracket] of segmentPath(path)) {
    const key = dot ?? bracket
    if (
      typeof cur !== 'object'
      || cur === null
      || !(key in cur)
    ) return undefined
    cur = cur[key as keyof typeof cur]
  }
  return cur
}

export function set() {

}