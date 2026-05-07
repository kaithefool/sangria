import { Fetch, useHttp } from '@/lib/fetch'

export default function App() {
  const h0 = useHttp<{ foo: 'bar' | 'bax' }>()
  const h1 = useHttp<{ qux: number }>()

  const n0 = <Fetch http={h0}>{(x) => <div></div>}</Fetch>
  const n1 = <Fetch http={[h0, h1]}>{(x, y) => <div></div>}</Fetch>
}
