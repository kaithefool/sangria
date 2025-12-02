import {
  ObjectId, InferSchemaType, FilterQuery, Model, pluralize,
  Document,
  model,
} from 'mongoose'

export type InferSchemaTypeWithId<TSchema> = InferSchemaType<TSchema>
  & { _id: ObjectId }

export function getArchiveMdlName(name: string) {
  return `Deleted${name}`
}
export function getArchiveCollName<T>(mdl: Model<T>): string {
  const name = pluralize()?.(getArchiveMdlName(mdl.modelName))
  if (name === undefined) throw new Error('pluralize func is absent')
  return name
}

export function delModel(...params: Parameters<typeof model>) {
  const [name, schema, ...rest] = params
  const s = schema?.clone()
  // no unique index in archive collection
  if (s !== undefined) s.set('autoIndex', false)
  model(getArchiveMdlName(name), s, ...rest)
}

export async function softDeleteOne<T>(
  this: Model<T>,
  filter: FilterQuery<T>,
) {
  await this.aggregate([
    { $match: filter },
    { $limit: 1 },
    {
      $merge: {
        into: getArchiveCollName(this),
        on: '_id',
        whenMatched: 'replace',
        whenNotMatched: 'insert',
      },
    },
  ])
  return this.deleteMany(filter)
}

export async function softDeleteMany<T>(
  this: Model<T>,
  filter: FilterQuery<T>,
) {
  await this.aggregate([
    { $match: filter },
    {
      $merge: {
        into: getArchiveCollName(this),
        on: '_id',
        whenMatched: 'replace',
        whenNotMatched: 'insert',
      },
    },
  ])
  return this.deleteMany(filter)
}

export async function softDelete<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  this: Document<any, any, T>,
) {
  const model = this.constructor as Model<T>
  await model.aggregate([
    { $match: { _id: this._id } },
    {
      $merge: {
        into: getArchiveCollName(model),
        on: '_id',
        whenMatched: 'replace',
        whenNotMatched: 'insert',
      },
    },
  ])
  return this.delete()
}
