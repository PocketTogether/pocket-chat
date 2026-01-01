import { imageInfoMessageListApiPerPageNumConfig } from '@/config'
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
//   "images": [
//     "RELATION_RECORD_ID"
//   ],
//   "created": "2022-01-01 10:00:00.123Z",
//   "updated": "2022-01-01 10:00:00.123Z"
// }

/** messagesImageInfoMessageList 查询 Expand 类型 */
export type MessagesResponseWithImageInfoMessageListExpand = MessagesResponse<
  MessagesRecordImageInfoMessageListExpand | undefined
>
type MessagesRecordImageInfoMessageListExpand = {
  author?: UsersResponse
}
/** 🧠 类型安全地构造 expend 字符串 */
export const messagesImageInfoMessageListExpend = (() => {
  const recordKeys = {
    author: 'author',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  > satisfies Group<
    // 限制键集合必须与 `[CollectionName]RecordExpand[DeepExpandKey]` 完全一致，且每个键的值必须与键名相同（KeyValueMirror）
    // 不仅是对键的检查，也是对 `[CollectionName]RecordExpand[DeepExpandKey]` 这个类型本身的检查
    KeyValueMirror<keyof MessagesRecordImageInfoMessageListExpand>
  >

  return `${recordKeys.author}` as const
  // type const = "author"
})()

/** 🧠 类型安全地构造 sort 字符串 */
export const messagesImageInfoMessageListSort = (() => {
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
export const messagesImageInfoMessageListFilterBuildFn = (data: {
  imageId: string
}) => {
  const recordKeys = {
    images: 'images',
    isDeleted: 'isDeleted',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  >

  return `${recordKeys.images}~'${data.imageId}' && ${recordKeys.isDeleted}=false` as const
  // type const = `images~'${string}' && isDeleted=false`
}

/** pocketbase 查询使用某个图片的消息列表，分页 */
export const pbMessagesImageInfoMessageListApi = async (data: {
  pageNum: number
  imageId: string
}) => {
  const {
    //
    pageNum,
    imageId,
  } = data

  // 查 imageId ，且 isDeleted 应为 false
  const filter = messagesImageInfoMessageListFilterBuildFn({
    imageId,
  })
  // created降序
  const sort = messagesImageInfoMessageListSort
  // expand author
  const expand = messagesImageInfoMessageListExpend

  // pocketbase jsSDK
  const pbRes = await pb
    .collection(Collections.Messages)
    .getList<MessagesResponseWithImageInfoMessageListExpand>(
      pageNum,
      imageInfoMessageListApiPerPageNumConfig,
      {
        sort,
        filter,
        expand,
        fetch: fetchWithTimeoutPreferred,
      }
    )

  return pbRes
}
