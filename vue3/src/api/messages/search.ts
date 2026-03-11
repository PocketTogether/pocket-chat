import { searchPageMessageListApiPerPageNumConfig } from '@/config'
import {
  Collections,
  pb,
  type MessagesRecord,
  type MessagesResponse,
  type UsersResponse,
} from '@/lib'
import type { Group, KeyValueMirror } from '@/types'
import { fetchWithTimeoutPreferred } from '@/utils'

// message是像这样的
// {
//   "collectionId": "pbc_2605467279",
//   "collectionName": "messages",
//   "id": "test",
//   "content": "test",
//   "author": "RELATION_RECORD_ID",
//   "replyMessage": "RELATION_RECORD_ID",
//   "isDeleted": false,
//   "users": [
//     "RELATION_RECORD_ID"
//   ],
//   "created": "2022-01-01 10:00:00.123Z",
//   "updated": "2022-01-01 10:00:00.123Z"
// }

/** messagesSearchPageMessageList 查询 Expand 类型 */
export type MessagesResponseWithSearchPageMessageListExpand = MessagesResponse<
  MessagesRecordSearchPageMessageListExpand | undefined
>
type MessagesRecordSearchPageMessageListExpand = {
  author?: UsersResponse
}
/** 🧠 类型安全地构造 expend 字符串 */
export const messagesSearchPageMessageListExpend = (() => {
  const recordKeys = {
    author: 'author',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  > satisfies Group<
    // 限制键集合必须与 `[CollectionName]RecordExpand[DeepExpandKey]` 完全一致，且每个键的值必须与键名相同（KeyValueMirror）
    // 不仅是对键的检查，也是对 `[CollectionName]RecordExpand[DeepExpandKey]` 这个类型本身的检查
    KeyValueMirror<keyof MessagesRecordSearchPageMessageListExpand>
  >

  return `${recordKeys.author}` as const
  // type const = "author"
})()

export type SearchPageSortModeType = 'created_desc' | 'created_asc'

/** 🧠 类型安全地构造 sort 字符串 */
export const messagesSearchPageMessageListSortBuildFn = (data: {
  sortMode: SearchPageSortModeType
}) => {
  const { sortMode } = data

  const recordKeys = {
    created: 'created',
    id: 'id',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  >

  // 降序 created_desc
  if (sortMode === 'created_desc') {
    return `-${recordKeys.created},${recordKeys.id}` as const
    // type const = "-created,id"
  }
  // 升序 created_asc
  else {
    return `${recordKeys.created},-${recordKeys.id}` as const
    // type const = "created,-id"
  }
}

/** 🧠 类型安全地构造 filter 字符串（严格遵守 strict-boolean-expressions） */
export const messagesSearchPageMessageListFilterBuildFn = (data: {
  searchContent?: string | null
}) => {
  const { searchContent } = data

  const recordKeys = {
    id: 'id',
    content: 'content',
    isDeleted: 'isDeleted',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  >

  if (searchContent == null || searchContent === '') {
    return `${recordKeys.isDeleted}=false` as const
    // type const = "isDeleted=false"
  }

  return `(
    ${recordKeys.content}~'${searchContent}' ||
    ${recordKeys.id}='${searchContent}'
  ) && ${recordKeys.isDeleted}=false` as const
  // type const = `(
  //   content~'${string}' ||
  //   id='${string}'
  // ) && isDeleted=false`
}

/** pocketbase 查询使用某个文件的消息列表，分页 */
export const pbMessagesSearchPageMessageListApi = async (data: {
  sortMode: SearchPageSortModeType
  searchContent?: string | null
  pageNum: number
}) => {
  const {
    //
    sortMode,
    searchContent,
    pageNum,
  } = data

  // 查 searchContent ，且 isDeleted 应为 false
  const filter = messagesSearchPageMessageListFilterBuildFn({
    searchContent,
  })
  // created降序
  const sort = messagesSearchPageMessageListSortBuildFn({
    sortMode,
  })
  // expand author
  const expand = messagesSearchPageMessageListExpend

  // pocketbase jsSDK
  const pbRes = await pb
    .collection(Collections.Messages)
    .getList<MessagesResponseWithSearchPageMessageListExpand>(
      pageNum,
      searchPageMessageListApiPerPageNumConfig,
      {
        sort,
        filter,
        expand,
        fetch: fetchWithTimeoutPreferred,
      }
    )

  return pbRes
}
