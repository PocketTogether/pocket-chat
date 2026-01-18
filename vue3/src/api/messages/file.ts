import { fileInfoMessageListApiPerPageNumConfig } from '@/config'
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
//   "files": [
//     "RELATION_RECORD_ID"
//   ],
//   "created": "2022-01-01 10:00:00.123Z",
//   "updated": "2022-01-01 10:00:00.123Z"
// }

/** messagesFileInfoMessageList 查询 Expand 类型 */
export type MessagesResponseWithFileInfoMessageListExpand = MessagesResponse<
  MessagesRecordFileInfoMessageListExpand | undefined
>
type MessagesRecordFileInfoMessageListExpand = {
  author?: UsersResponse
}
/** 🧠 类型安全地构造 expend 字符串 */
export const messagesFileInfoMessageListExpend = (() => {
  const recordKeys = {
    author: 'author',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  > satisfies Group<
    // 限制键集合必须与 `[CollectionName]RecordExpand[DeepExpandKey]` 完全一致，且每个键的值必须与键名相同（KeyValueMirror）
    // 不仅是对键的检查，也是对 `[CollectionName]RecordExpand[DeepExpandKey]` 这个类型本身的检查
    KeyValueMirror<keyof MessagesRecordFileInfoMessageListExpand>
  >

  return `${recordKeys.author}` as const
  // type const = "author"
})()

/** 🧠 类型安全地构造 sort 字符串 */
export const messagesFileInfoMessageListSort = (() => {
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
export const messagesFileInfoMessageListFilterBuildFn = (data: {
  fileId: string
}) => {
  const recordKeys = {
    file: 'file',
    isDeleted: 'isDeleted',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  >

  return `${recordKeys.file}='${data.fileId}' && ${recordKeys.isDeleted}=false` as const
  // type const = `file='${string}' && isDeleted=false`
}

/** pocketbase 查询使用某个文件的消息列表，分页 */
export const pbMessagesFileInfoMessageListApi = async (data: {
  pageNum: number
  fileId: string
}) => {
  const {
    //
    pageNum,
    fileId,
  } = data

  // 查 fileId ，且 isDeleted 应为 false
  const filter = messagesFileInfoMessageListFilterBuildFn({
    fileId,
  })
  // created降序
  const sort = messagesFileInfoMessageListSort
  // expand author
  const expand = messagesFileInfoMessageListExpend

  // pocketbase jsSDK
  const pbRes = await pb
    .collection(Collections.Messages)
    .getList<MessagesResponseWithFileInfoMessageListExpand>(
      pageNum,
      fileInfoMessageListApiPerPageNumConfig,
      {
        sort,
        filter,
        expand,
        fetch: fetchWithTimeoutPreferred,
      }
    )

  return pbRes
}
