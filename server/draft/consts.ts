export const roles = ['client', 'admin'] as const
export type Role = typeof roles[number]
