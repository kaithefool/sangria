import { describe, expect, it } from 'vitest'
import { parallelStates } from './parallel'
import { HttpError, type HttpState } from './http'
import { AxiosError, AxiosHeaders } from 'axios'

const e0 = new HttpError(new AxiosError('Network Error'))
const e1 = new HttpError(new AxiosError('', 'ECONNABORTED'))
const e2 = new HttpError(
  new AxiosError('', '', { headers: new AxiosHeaders() }, undefined, {
    statusText: 'Not Found',
    status: 404,
    data: { foo: 'bar' },
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  }),
)

describe('parallel http states', () => {
  it.each<HttpState[]>([
    [{ status: 'ready' }, { status: 'error', error: e0 }],
    [{ status: 'error', error: e0 }, { status: 'ready' }],
    [
      { status: 'pending', progress: 0.5 },
      { status: 'error', error: e0 },
    ],
    [
      { status: 'error', error: e0 },
      { status: 'pending', progress: 0.5 },
    ],
    [
      { status: 'success', code: 200, payload: null, progress: 1 },
      { status: 'error', error: e0 },
    ],
    [
      { status: 'error', error: e0 },
      { status: 'success', code: 200, payload: null, progress: 1 },
    ],
  ])('returns error status if one of the state has error', (...states) => {
    expect(parallelStates(states)).toMatchObject({
      status: 'error',
      errors: [e0],
      codes: [undefined],
    })
  })
  it.each<HttpState[]>([
    [
      { status: 'ready' },
      { status: 'pending', progress: 0.5 },
      { status: 'success', code: 200, payload: null, progress: 1 },
      { status: 'error', error: e0 },
      { status: 'error', error: e1 },
      { status: 'error', error: e2, code: 404, payload: { foo: 'bar' } },
    ],
    [
      { status: 'ready' },
      { status: 'error', error: e0 },
      { status: 'pending', progress: 0.5 },
      { status: 'error', error: e1 },
      { status: 'success', code: 200, payload: null, progress: 1 },
      { status: 'error', error: e2, code: 404, payload: { foo: 'bar' } },
    ],
  ])('aggregates error responses', (...states) => {
    expect(parallelStates(states)).toMatchObject({
      status: 'error',
      errors: [e0, e1, e2],
      codes: [undefined, undefined, 404],
      payloads: [undefined, undefined, { foo: 'bar' }],
    })
  })
  it.each<[HttpState[], number]>([
    [[{ status: 'ready' }, { status: 'pending', progress: 0.5 }], 0.25],
    [[{ status: 'pending', progress: 0.5 }, { status: 'ready' }], 0.25],
    [
      [
        { status: 'success', code: 200, payload: null, progress: 1 },
        { status: 'pending', progress: 0.5 },
      ],
      0.75,
    ],
    [
      [
        { status: 'pending', progress: 0.5 },
        { status: 'success', code: 200, payload: null, progress: 1 },
      ],
      0.75,
    ],
    [
      [
        { status: 'success', code: 200, payload: null, progress: 1 },
        { status: 'pending', progress: 0.5 },
        { status: 'success', code: 200, payload: null, progress: 1 },
        { status: 'pending', progress: 0.25 },
      ],
      0.6875,
    ],
    [
      [
        { status: 'pending', progress: 0.25 },
        { status: 'success', code: 200, payload: null, progress: 1 },
        { status: 'pending', progress: 0.5 },
        { status: 'success', code: 200, payload: null, progress: 1 },
      ],
      0.6875,
    ],
  ])(
    'returns pending status with total progress if one of the state is pending',
    (states, progress) => {
      expect(parallelStates(states)).toMatchObject({
        status: 'pending',
        progress,
      })
    },
  )
  it('prevent float precision problem', () => {
    expect(
      parallelStates([
        { status: 'success', code: 200, payload: null, progress: 1 },
        { status: 'success', code: 200, payload: null, progress: 1 },
        { status: 'success', code: 200, payload: null, progress: 1 },
      ]),
    ).toMatchObject({ progress: 1 })
  })
  it('aggregate success payloads & codes', () => {
    expect(
      parallelStates([
        { status: 'success', code: 200, payload: { foo: 1 }, progress: 1 },
        { status: 'success', code: 201, payload: ['bar'], progress: 1 },
        { status: 'success', code: 202, payload: null, progress: 1 },
      ]),
    ).toMatchObject({
      status: 'success',
      progress: 1,
      payloads: [{ foo: 1 }, ['bar'], null],
      codes: [200, 201, 202],
    })
  })
})
