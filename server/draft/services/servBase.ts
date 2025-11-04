import { FilterQuery } from 'mongoose'

export function matchSoftDelete<T extends { deletedAt?: Date }>(
  filter: FilterQuery<T>,
): FilterQuery<T> {
  return { ...filter, deletedAt: null }
}

export function matchSearch<T>(
  filter: FilterQuery<T>,
  fields: keyof T[],
) {}
