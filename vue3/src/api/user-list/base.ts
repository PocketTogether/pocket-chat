import type { UsersResponse } from '@/lib'

export type UsersResponseWithBaseExpand = UsersResponse

// 类型安全地构造 expand 字符串（暂不需要expand）
export const usersBaseExpand = ''
