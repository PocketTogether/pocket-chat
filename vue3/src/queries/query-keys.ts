import type { PMLRCApiParameters0DataPageParamNonNullable } from '@/api'
import type { Ref } from 'vue'

export const queryKeys = {
  profile: (id: string) => ['profile', id] as const,
  listAuthMethods: () => ['listAuthMethods'] as const,
  pbCollectionConfig: () => ['pbCollectionConfig'] as const,
  /** useChatRoomMessagesInfiniteQuery */
  chatRoomMessagesInfinite: (roomId: string | null) =>
    ['chatRoomMessagesInfinite', roomId] as const,
  /** useChatRoomMessagesInfiniteTwowayQuery */
  chatRoomMessagesInfiniteTwoway: (
    roomId: string | null,
    twowayPositioningCursorData: PMLRCApiParameters0DataPageParamNonNullable | null
  ) =>
    [
      'chatRoomMessagesInfiniteTwoway',
      roomId,
      twowayPositioningCursorData,
    ] as const,

  /** useChatRoomMessagesGetOneQuery */
  chatRoomMessagesGetOne: (messageId?: string | null) =>
    ['chatRoomMessagesGetOne', messageId] as const,

  /** useImagePageListQuery */
  imagePageList: (
    authorId?: string | null,
    searchContent?: string | null,
    pageNum?: number | null,
    /** 可自定义的充当唯一标识的字符串 */
    customStrId?: string | null
  ) => {
    return [
      'imagePageList',
      ...definedOrEmpty(authorId),
      ...definedOrEmpty(searchContent),
      ...definedOrEmpty(pageNum),
      ...definedOrEmpty(customStrId),
    ] as const
    // return ['imagePageList', pageNum, authorId, searchContent] as const
  },

  /** useImagesGetOneQuery */
  imagesGetOne: (imageId?: string | null) => {
    return [
      //
      'imagesGetOne',
      ...definedOrEmpty(imageId),
    ] as const
  },

  /** useImageInfoMessageListQuery */
  imageInfoMessageList: (imageId?: string | null, pageNum?: number | null) => {
    return [
      'imageInfoMessageList',
      ...definedOrEmpty(imageId),
      ...definedOrEmpty(pageNum),
    ] as const
  },

  /** useFilePageListQuery */
  filePageList: (
    authorId?: string | null,
    searchContent?: string | null,
    pageNum?: number | null,
    /** 可自定义的充当唯一标识的字符串 */
    customStrId?: string | null
  ) => {
    return [
      'filePageList',
      ...definedOrEmpty(authorId),
      ...definedOrEmpty(searchContent),
      ...definedOrEmpty(pageNum),
      ...definedOrEmpty(customStrId),
    ] as const
    // return ['filePageList', pageNum, authorId, searchContent] as const
  },

  /** useFilesGetOneQuery */
  filesGetOne: (fileId?: string | null) => {
    return [
      //
      'filesGetOne',
      ...definedOrEmpty(fileId),
    ] as const
  },

  /** useFileInfoMessageListQuery */
  fileInfoMessageList: (fileId?: string | null, pageNum?: number | null) => {
    return [
      'fileInfoMessageList',
      ...definedOrEmpty(fileId),
      ...definedOrEmpty(pageNum),
    ] as const
  },

  /**  */
  rooms: (...args: string[]) => ['rooms', ...args] as const,
  /** useRoomsGetOneQuery */
  roomsGetOne: (roomId: string | null) => ['roomsGetOne', roomId],
  /**
   * @description rooms-list-infinite
   * 搜索词
   * - @param {Ref<string>} options.searchTerm
   * 只看用户自己
   * - @param {Ref<boolean>} options.onlyUserRooms
   */
  roomsListInfinite: (options: {
    searchTerm: Ref<string>
    onlyUserRooms: Ref<boolean>
    onlyJoinRooms: Ref<boolean>
    userId: string | null | undefined
  }) => ['rooms', 'list', 'infinite', options] as const,
}

/**
 * 将单个值包装为元组：如果值为 `undefined`，返回空元组；否则返回仅包含该值的单元素元组。
 *
 * 主要用途：在构建 TanStack Query 的 Query Key 时，根据“是否传入参数”
 * 决定该参数是否出现在 Key 中，而不是让 `undefined` 作为占位符进入数组。
 *
 * 这样做的核心目的，是为了在使用 `queryClient.invalidateQueries` 时，
 * 能够通过较短的前缀 Key 进行模糊匹配，从而一次性失效同一类请求。
 *
 * 【260104】注意，使用 queryClient.invalidateQueries 时需注意，其有问题
 * note\笔记251120\260104-关于 TanStack Vue Query 动态 queryKey 与 invalidateQueries 异常行为数据或缓存污染的分析笔记.md
 * 现在确认了，只要在invalidateQueries时，没有多个useQuery的key相同且都是active，就不会有问题
 *
 * 若参数为 `undefined`，则该维度会被完全省略，不会占据数组位置；
 * 若参数为 `null` 或其他有效值，则会被保留。
 *
 * ```
 * // 示例
 * [
 *   'imagePageList',
 *   ...definedOrEmpty(pageNum),
 *   ...definedOrEmpty(authorId),
 *   ...definedOrEmpty(searchContent),
 * ] as const
 *
 * // 其效果与以下手写展开写法完全一致：
 * [
 *   'imagePageList',
 *   ...(pageNum === undefined ? ([] as const) : ([pageNum] as const)),
 *   ...(authorId === undefined ? ([] as const) : ([authorId] as const)),
 *   ...(searchContent === undefined ? ([] as const) : ([searchContent] as const)),
 * ] as const
 * ```
 *
 * 使用本函数可以避免重复书写上述三元展开逻辑，使代码更简洁且语义更明确。
 *
 * 类型行为：
 * - 若传入类型为 `T | undefined`，返回类型会推导为 `[] | [T]`；
 * - 在展开到 Query Key 时，可保持精确的元组联合类型；
 * - 不会引入 `(T | undefined)[]` 这种宽化类型。
 *
 * 示例：
 *   definedOrEmpty(123)        // => [123]
 *   definedOrEmpty(null)       // => [null]
 *   definedOrEmpty(undefined)  // => []
 *
 * @param value - 要包装的值；若为 `undefined` 则从 Query Key 中省略该维度。
 * @returns 空元组或单元素元组，用于安全地展开进 Query Key。
 */
function definedOrEmpty<T>(value: T) {
  return value === undefined ? ([] as const) : ([value] as const)
}
