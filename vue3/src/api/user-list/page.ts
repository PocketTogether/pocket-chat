import { Collections, pb, type UsersRecord } from '@/lib'
import type { Group, KeyValueMirror } from '@/types'
import { usersBaseExpand, type UsersResponseWithBaseExpand } from './base'
import { usersPageListApiPerPageNumConfig } from '@/config'
import { fetchWithTimeoutPreferred } from '@/utils'

export type UsersPageSortModeType = 'joined_at_desc' | 'joined_at_asc'

/** 🧠 类型安全地构造 sort 字符串 */
export const usersPageSortBuildFn = (data: {
  sortMode: UsersPageSortModeType
}) => {
  const { sortMode } = data

  const recordKeys = {
    created: 'created',
    id: 'id',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof UsersRecord>>
  >

  // 降序 joined_at_desc
  if (sortMode === 'joined_at_desc') {
    return `-${recordKeys.created},${recordKeys.id}` as const
    // type const = "-created,id"
  }
  // 升序 joined_at_asc
  else {
    return `${recordKeys.created},-${recordKeys.id}` as const
    // type const = "created,-id"
  }
}

/** 🧠 类型安全地构造 filter 字符串（严格遵守 strict-boolean-expressions） */
export const usersPageFilterBuildFn = (data: { search?: string | null }) => {
  const recordKeys = {
    username: 'username',
    name: 'name',
    bio: 'bio',
    id: 'id',
    isBanned: 'isBanned',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof UsersRecord>>
  >

  // --- search 部分 ---
  const filterSearchPart = (() => {
    if (data.search == null) {
      return null
    }
    if (data.search === '') {
      return null
    }
    const s = data.search
    return `(
      ${recordKeys.username}~'${s}' ||
      ${recordKeys.name}~'${s}' ||
      ${recordKeys.bio}~'${s}' ||
      ${recordKeys.id}='${s}'
    )` as const
  })()

  // --- isBanned 部分 ---
  const filterIsBannedPart = `${recordKeys.isBanned}=false` as const

  // --- 显式 if 分支 ---
  if (filterSearchPart != null) {
    // return filterSearchPart
    return `(
    ${filterSearchPart} &&
    ${filterIsBannedPart}
    )` as const
  }
  // 两者都为 null
  return filterIsBannedPart
}

/** 用户分页查询 */
export const pbUsersPageListApi = async (
  page: number,
  data: {
    sortMode: UsersPageSortModeType
    search?: string | null
  }
) => {
  const sort = usersPageSortBuildFn(data)
  const filter = usersPageFilterBuildFn(data)

  // pocketbase jsSDK
  const pbRes = await pb
    .collection(Collections.Users)
    .getList<UsersResponseWithBaseExpand>(
      page,
      usersPageListApiPerPageNumConfig,
      {
        expand: usersBaseExpand,
        sort,
        filter,
        fetch: fetchWithTimeoutPreferred,
      }
    )

  return pbRes
}
