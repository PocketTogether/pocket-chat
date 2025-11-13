import { chatRoomMessagesInfiniteQueryPerPageNumberConfig } from '@/config'
import {
  Collections,
  pb,
  type MessagesRecord,
  type MessagesResponse,
} from '@/lib'
import type { Group, KeyValueMirror } from '@/types'
import { fetchWithTimeoutPreferred } from '@/utils'
import { messagesExpand, type MessagesResponseWidthExpand } from './base'

/** messages集合 游标分页查询 */
export const pbMessagesListRoomCursorApi = async (data: {
  /** 指定房间（空字符串即为全局聊天） */
  roomId: string
  /** 作为游标的数据 */
  // pageParam: MessagesResponse | null
  // pageParam: {
  //   id: string
  //   created: string
  // } | null
  pageParam: Pick<MessagesResponse, 'id' | 'created'> | null
}) => {
  const { roomId, pageParam } = data

  // expand 字符串
  const expand = messagesExpand

  // 类型安全地构造 sort 字符串
  const sort = (() => {
    const recordKeys = {
      created: 'created',
      id: 'id',
    } as const satisfies Group<
      // 限制键必须来自 `MessagesRecord` 且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
      Partial<KeyValueMirror<keyof MessagesRecord>>
    >
    // 将字段键拼接为 sort 查询字符串
    // -created,id
    // 日期降序，（日期相同时）id升序
    return `-${recordKeys.created},${recordKeys.id}`
  })()

  // 类型安全地构造 filter 字符串
  const filter = (() => {
    const recordKeys = {
      created: 'created',
      id: 'id',
    } as const satisfies Group<
      // 限制键必须来自 `MessagesRecord` 且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
      Partial<KeyValueMirror<keyof MessagesRecord>>
    >
    // 无所属房间（房间id为空字符串）即为全局聊天
    /**
     * - 指定房间
     * - 控制游标
     */
    return (() => {
      // 第一次查询，无需游标
      if (pageParam == null) {
        return ''
      }
      // 不是第一次查询，需控制游标
      /**
       * 查询created比游标所指的小的，因为上面的sort是created降序排序。
       * 需要考虑到created相同的情况，所以需要借助id来固定顺序，
       * 上面的sort是（日期相同时）id升序，所以created相等时查询id比游标所指小的
       * ```
       *   (
       *     created<'2025-08-22 11:14:09.288Z' ||
       *     (
       *       created='2025-08-22 11:14:09.288Z' &&
       *       id>'syta3u7m0eeud1a'
       *     )
       *   )
       * ```
       */
      // const filterStr =
      return `
        (
          ${recordKeys.created}<'${pageParam.created}' ||
          (
            ${recordKeys.created}='${pageParam.created}' &&
            ${recordKeys.id}>'${pageParam.id}'
          )
        )
      `
      // console.log(filterStr)
      // return filterStr
    })()
  })()

  // 🚀 发起 PocketBase 查询，携带类型安全的 expand 字段与 Expand 类型，并有 sort filter
  const pbRes = await pb
    .collection(Collections.Messages)
    .getList<MessagesResponseWidthExpand>(
      1,
      chatRoomMessagesInfiniteQueryPerPageNumberConfig,
      {
        expand,
        sort,
        filter,
        // timeout为5000
        fetch: fetchWithTimeoutPreferred,
      }
    )
  // pbRes.items[0].expand
  // console.log(pbRes)
  return pbRes
}
/**
 * 将 pbMessagesListRoomCursorApi 参数 pageParam 的类型导出以便使用，
 * pageParam 即作为游标的数据
 */
export type PMLRCApiParameters0DataPageParamNonNullable = NonNullable<
  Parameters<typeof pbMessagesListRoomCursorApi>[0]['pageParam']
>
/**
 * 将 pbMessagesListRoomCursorApi 的返回值类型导出以便使用
 */
export type PMLRCApiReturnType = Awaited<
  ReturnType<typeof pbMessagesListRoomCursorApi>
>
/**
 * 将 pbMessagesListRoomCursorApi 的返回值中的items的item类型导出以便使用
 */
export type PMLRCApiReturnTypeItem = PMLRCApiReturnType['items'][number]

// 上面的是用于单向的（基础的），下面的是用于双向的

/** messages集合 游标分页查询 Next 向更旧的查询 pageParam 为 null 即从最新消息开始查询的第一次查询（和 pbMessagesListRoomCursorApi 逻辑一样） */
export const pbMessagesListRoomCursorNextPageParamNullApi = async (data: {
  roomId: string
}): Promise<PMLRCApiReturnType> => {
  const { roomId } = data
  return pbMessagesListRoomCursorApi({
    roomId,
    pageParam: null,
  })
}

/** messages集合 游标分页查询 Next 向更旧的查询 不包括游标所指的（和 pbMessagesListRoomCursorApi 逻辑一样） */
export const pbMessagesListRoomCursorNextNotIncludeCursorApi = async (data: {
  roomId: string
  pageParam: Pick<MessagesResponse, 'id' | 'created'>
}): Promise<PMLRCApiReturnType> => {
  const { roomId, pageParam } = data
  return pbMessagesListRoomCursorApi({
    roomId,
    pageParam,
  })
}

/** messages集合 游标分页查询 Next 向更旧的查询 包括游标所指的（将用于双向查询的首次） */
export const pbMessagesListRoomCursorNextIncludeCursorApi = async (data: {
  roomId: string
  pageParam: Pick<MessagesResponse, 'id' | 'created'>
}): Promise<PMLRCApiReturnType> => {
  const { roomId, pageParam } = data

  // expand 字符串
  const expand = messagesExpand

  // 类型安全地构造 sort 字符串
  const sort = (() => {
    const recordKeys = {
      created: 'created',
      id: 'id',
    } as const satisfies Group<
      // 限制键必须来自 `MessagesRecord` 且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
      Partial<KeyValueMirror<keyof MessagesRecord>>
    >
    // 将字段键拼接为 sort 查询字符串
    // -created,id
    // 日期降序，（日期相同时）id升序
    return `-${recordKeys.created},${recordKeys.id}`
  })()

  // 类型安全地构造 filter 字符串
  const filter = (() => {
    const recordKeys = {
      created: 'created',
      id: 'id',
    } as const satisfies Group<
      // 限制键必须来自 `MessagesRecord` 且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
      Partial<KeyValueMirror<keyof MessagesRecord>>
    >
    // 无所属房间（房间id为空字符串）即为全局聊天
    /**
     * - 指定房间
     * - 控制游标
     */
    /**
     * 查询created比游标所指的小的，因为上面的sort是created降序排序。
     * 需要考虑到created相同的情况，所以需要借助id来固定顺序，
     * 上面的sort是（日期相同时）id升序，所以created相等时查询id比游标所指小或等于的（即包括游标所指的）
     * ```
     *   (
     *     created<'2025-08-22 11:14:09.288Z' ||
     *     (
     *       created='2025-08-22 11:14:09.288Z' &&
     *       id>='syta3u7m0eeud1a'
     *     )
     *   )
     * ```
     */
    return `
      (
        ${recordKeys.created}<'${pageParam.created}' ||
        (
          ${recordKeys.created}='${pageParam.created}' &&
          ${recordKeys.id}>='${pageParam.id}'
        )
      )
    `
  })()

  // 发起 PocketBase 查询，携带类型安全的 expand 字段与 Expand 类型，并有 sort filter
  const pbRes = await pb
    .collection(Collections.Messages)
    .getList<MessagesResponseWidthExpand>(
      1,
      chatRoomMessagesInfiniteQueryPerPageNumberConfig,
      {
        expand,
        sort,
        filter,
        // timeout为5000
        fetch: fetchWithTimeoutPreferred,
      }
    )
  // console.log(pbRes)
  return pbRes
}

/** messages集合 游标分页查询 Previous 向更新的查询 不包括游标所指的 */
export const pbMessagesListRoomCursorPreviousNotIncludeCursorApi =
  async (data: {
    roomId: string
    pageParam: Pick<MessagesResponse, 'id' | 'created'>
  }): Promise<PMLRCApiReturnType> => {
    const { roomId, pageParam } = data

    // expand 字符串
    const expand = messagesExpand

    // 类型安全地构造 sort 字符串
    const sort = (() => {
      const recordKeys = {
        created: 'created',
        id: 'id',
      } as const satisfies Group<
        // 限制键必须来自 `MessagesRecord` 且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
        Partial<KeyValueMirror<keyof MessagesRecord>>
      >
      // 将字段键拼接为 sort 查询字符串
      // created,-id
      // 日期升序，（日期相同时）id降序
      return `${recordKeys.created},-${recordKeys.id}`
    })()

    // 类型安全地构造 filter 字符串
    const filter = (() => {
      const recordKeys = {
        created: 'created',
        id: 'id',
      } as const satisfies Group<
        // 限制键必须来自 `MessagesRecord` 且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
        Partial<KeyValueMirror<keyof MessagesRecord>>
      >
      // 无所属房间（房间id为空字符串）即为全局聊天
      /**
       * - 指定房间
       * - 控制游标
       */
      /**
       * 查询created比游标所指的大的，因为上面的sort是created升序排序。
       * 需要考虑到created相同的情况，所以需要借助id来固定顺序，
       * 上面的sort是（日期相同时）id降序，所以created相等时查询id比游标所指大的
       * ```
       *   (
       *     created>'2025-08-22 11:14:09.288Z' ||
       *     (
       *       created='2025-08-22 11:14:09.288Z' &&
       *       id<'syta3u7m0eeud1a'
       *     )
       *   )
       * ```
       */
      return `
        (
          ${recordKeys.created}>'${pageParam.created}' ||
          (
            ${recordKeys.created}='${pageParam.created}' &&
            ${recordKeys.id}<'${pageParam.id}'
          )
        )
      `
    })()

    // 发起 PocketBase 查询，携带类型安全的 expand 字段与 Expand 类型，并有 sort filter
    const pbRes = await pb
      .collection(Collections.Messages)
      .getList<MessagesResponseWidthExpand>(
        1,
        chatRoomMessagesInfiniteQueryPerPageNumberConfig,
        {
          expand,
          sort,
          filter,
          // timeout为5000
          fetch: fetchWithTimeoutPreferred,
        }
      )
    // console.log(pbRes)
    return pbRes
  }
