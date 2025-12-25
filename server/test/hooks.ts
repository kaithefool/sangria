import { expect, beforeEach, afterEach } from '@jest/globals'

function getTestId() {
  const s = expect.getState()
  return `${s.testPath}:${s.currentTestName}`
}

const afterThisStack: {
  [x: string]: Array<() => void>
} = {}

afterEach(async () => {
  const id = getTestId()
  const stack = afterThisStack[id]
  if (stack !== undefined) {
    const s = [...stack].reverse()
    delete afterThisStack[id]
    for (const fn of s) {
      await fn()
    }
  }
})

export function afterThis(fn: () => void) {
  const testId = getTestId()
  afterThisStack[testId] = [
    ...afterThisStack[testId] ?? [],
    fn,
  ]
}

const beforeThisStack: {
  [x: string]: Array<() => void>
} = {}

beforeEach(async () => {
  const stack = beforeThisStack[getTestId()]
  if (stack !== undefined) {
    const s = [...stack].reverse()
    for (const fn of s) {
      await fn()
    }
  }
})

export function beforeThis(fn: () => void) {
  const testId = getTestId()
  beforeThisStack[testId] = [
    ...beforeThisStack[testId] ?? [],
    fn,
  ]
}
