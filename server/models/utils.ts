import { SqlCfVal, SqlDataType } from '../lib/query'

export type NonEditable = 'id' | 'created_at' | 'updated_at'

export type NonNullKeys<R> = {
  [P in keyof R]: Extract<R[P], null | undefined> extends never
    ? P : never
}[keyof R]

export type RowInsert<
  Row,
  Requires extends keyof Row = NonNullKeys<Row>,
> = Omit<
  Pick<Row, Requires> & Partial<Omit<Row, Requires>>,
  NonEditable
>

export type RowUpdate<R> = Partial<Omit<R, NonEditable>>

export type RowsFilter<R> = {
  [P in keyof R]?: Extract<R[P], boolean> extends never
    ? SqlCfVal<Extract<R[P], SqlDataType>>
    : R[P]
}

export type SelectRowsOpts<Row, Filter> = {
  filter?: Filter
  sort?: { [p in keyof Row]?: 1 | -1 }
  skip?: number
  limit?: number
}
