import { usersInfoMessageListApiPerPageNumConfig } from '@/config'
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

/** messagesUserInfoMessageList 查询 Expand 类型 */
export type MessagesResponseWithUserInfoMessageListExpand = MessagesResponse<
  MessagesRecordUserInfoMessageListExpand | undefined
>
type MessagesRecordUserInfoMessageListExpand = {
  author?: UsersResponse
}
/** 🧠 类型安全地构造 expend 字符串 */
export const messagesUserInfoMessageListExpend = (() => {
  const recordKeys = {
    author: 'author',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  > satisfies Group<
    // 限制键集合必须与 `[CollectionName]RecordExpand[DeepExpandKey]` 完全一致，且每个键的值必须与键名相同（KeyValueMirror）
    // 不仅是对键的检查，也是对 `[CollectionName]RecordExpand[DeepExpandKey]` 这个类型本身的检查
    KeyValueMirror<keyof MessagesRecordUserInfoMessageListExpand>
  >

  return `${recordKeys.author}` as const
  // type const = "author"
})()

/** 🧠 类型安全地构造 sort 字符串 */
export const messagesUserInfoMessageListSort = (() => {
  const recordKeys = {
    created: 'created',
    id: 'id',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  >

  return `-${recordKeys.created},${recordKeys.id}` as const
  // type const = "-created,id"
})()

/** 🧠 类型安全地构造 filter 字符串（严格遵守 strict-boolean-expressions） */
export const messagesUserInfoMessageListFilterBuildFn = (data: {
  userId: string
}) => {
  const recordKeys = {
    author: 'author',
    isDeleted: 'isDeleted',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  >

  return `${recordKeys.author}='${data.userId}' && ${recordKeys.isDeleted}=false` as const
  // type const = `author='${string}' && isDeleted=false`
}

/** pocketbase 查询使用某个文件的消息列表，分页 */
export const pbMessagesUserInfoMessageListApi = async (data: {
  pageNum: number
  userId: string
}) => {
  const {
    //
    pageNum,
    userId,
  } = data

  // 查 userId ，且 isDeleted 应为 false
  const filter = messagesUserInfoMessageListFilterBuildFn({
    userId,
  })
  // created降序
  const sort = messagesUserInfoMessageListSort
  // expand author
  const expand = messagesUserInfoMessageListExpend

  // pocketbase jsSDK
  const pbRes = await pb
    .collection(Collections.Messages)
    .getList<MessagesResponseWithUserInfoMessageListExpand>(
      pageNum,
      usersInfoMessageListApiPerPageNumConfig,
      {
        sort,
        filter,
        expand,
        fetch: fetchWithTimeoutPreferred,
      }
    )

  return pbRes
}
