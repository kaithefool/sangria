export type MongoDupError = {
  code: 11000
  keyPattern: { [x: string]: number }
  keyValue: { [x: string]: unknown }
}

function isMongoDupError(v: unknown): v is MongoDupError {
  if (
    typeof v === 'object'
    && v !== null
    && v.constructor.name === 'MongoServerError'
    && 'code' in v
    && v.code === 11000
  ) {
    return true
  }
  return false
}

export async function catchDupErr<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends () => any,
>(fn: F): Promise<[MongoDupError] | [null, Awaited<ReturnType<F>>]> {
  try {
    return [null, await fn()]
  }
  catch (e: unknown) {
    if (isMongoDupError(e)) {
      return [e]
    }
    throw e
  }
}
