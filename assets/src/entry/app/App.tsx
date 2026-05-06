import { FetchPayload, useHttp } from '@/lib/http'

export default function App() {
  const h0 = useHttp<{ foo: 'bar' | 'bax' }>()
  const h1 = useHttp<{ qux: number }>()

  const n0 = <FetchPayload http={h0}>{(x) => <div></div>}</FetchPayload>
  const n1 = (
    <FetchPayload http={[h0, h1]}>{(x, y) => <div></div>}</FetchPayload>
  )
}
