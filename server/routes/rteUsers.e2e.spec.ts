import { describe } from '@jest/globals'
import request, { Request } from 'superagent'
import { afterThis, api } from '../test'

const base = `${api.root}/api/users`

async function teardown(req: Request) {
  const res = await req
  if (typeof res?.body?._id === 'string') {
    afterThis(() => request.delete(`${base}/${res.body._id}`))
  }
  return res
}

describe('Users API', () => {
  const expected = {
    role: 'admin',
    email: 'foo@bar.com',
  }
  const insert = { ...expected, password: '12345678' }

  api.testPost(base, insert, expected, teardown)
  api.testGetList(base)
  api.testGetFindOneById(base, insert, expected, teardown)
  api.testPatch(
    base,
    insert, { role: 'client' }, { ...expected, role: 'client' },
    teardown,
  )
  api.testDelete(base, insert)

  api.testPostUIdx(base, insert, teardown)
  api.testPatchUIdx(base, insert, { email: 'bax@bar.com' }, teardown)
})
