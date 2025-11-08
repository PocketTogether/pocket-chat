import { chatRoomMessagesInfiniteQueryPerPageNumberConfig } from '@/config'
import {
  Collections,
  onPbResErrorStatus401AuthClear,
  pb,
  type Create,
  type MessagesRecord,
  type MessagesResponse,
  type Update,
  type UsersResponse,
} from '@/lib'
import type { Group, KeyValueMirror } from '@/types'
import { fetchWithTimeoutPreferred } from '@/utils'
import type { RecordSubscription } from 'pocketbase'
import { messagesExpand, type MessagesResponseWidthExpand } from './base'

/** messages集合 发送消息 需登录 */
export const pbMessagesSendChatApi = async (data: {
  /** 房间id，空字符串或null都可代表全局聊天 */
  roomId?: string | null
  content: string
  /** 回复的帖子id，空字符串或null都可代表无 */
  replyMessageId?: string | null
}) => {
  const { roomId, content, replyMessageId } = data

  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备数据
  const createData: Create<Collections.Messages> = {
    author: pb.authStore.record.id,
    content: content,
    // room: (() => {
    //   if (roomId == null) {
    //     return undefined
    //   }
    //   if (roomId === '') {
    //     // 其实返回空字符串也可以
    //     return undefined
    //   }
    //   return roomId
    // })(),
    replyMessage: (() => {
      if (replyMessageId == null) {
        return undefined
      }
      if (replyMessageId === '') {
        // 其实返回空字符串也可以
        return undefined
      }
      return replyMessageId
    })(),
  }

  // 通过 pocketbase SDK 请求
  const pbRes = await pb
    .collection(Collections.Messages)
    .create(createData, {
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
    .catch((error) => {
      // 出现鉴权失败则清除authStore
      onPbResErrorStatus401AuthClear(error)
      throw error
    })
  return pbRes
}

/** messages集合 修改消息 需登录 */
export const pbMessagesEditChatApi = async (data: {
  // 修改的消息的id
  chatEditMessageId: string
  // 消息内容
  content: string
  /** 回复的帖子id，空字符串或null都可代表无 */
  replyMessageId?: string | null
}) => {
  const { chatEditMessageId, content, replyMessageId } = data

  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备数据
  const updateData: Update<Collections.Messages> = {
    content: content,
    replyMessage: (() => {
      if (replyMessageId == null) {
        return ''
      }
      return replyMessageId
    })(),
  }

  // 通过 pocketbase SDK 请求
  const pbRes = await pb
    .collection(Collections.Messages)
    .update(chatEditMessageId, updateData, {
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
    .catch((error) => {
      // 出现鉴权失败则清除authStore
      onPbResErrorStatus401AuthClear(error)
      throw error
    })
  return pbRes
}

/** messages集合 删除消息 需登录 */
export const pbMessagesDeleteChatApi = async (data: {
  // 修改的消息的id
  messageId: string
}) => {
  const { messageId } = data

  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备数据
  const updateData: Update<Collections.Messages> = {
    isDeleted: true,
  }

  // 通过 pocketbase SDK 请求
  const pbRes = await pb
    .collection(Collections.Messages)
    .update(messageId, updateData, {
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
    .catch((error) => {
      // 出现鉴权失败则清除authStore
      onPbResErrorStatus401AuthClear(error)
      throw error
    })
  return pbRes
}

/** messages集合 消息实时订阅 */
export const pbMessagesSubscribeAllApi = async (
  callback: (data: RecordSubscription<MessagesResponseWidthExpand>) => void
) => {
  // expand 字符串
  const expand = messagesExpand

  return pb
    .collection(Collections.Messages)
    .subscribe<MessagesResponseWidthExpand>(
      '*',
      (e) => {
        callback(e)
      },
      {
        expand,
        // timeout为5000
        fetch: fetchWithTimeoutPreferred,
      }
    )
}

/** messages集合 getOne */
export const pbMessagesGetOneApi = async (messageId: string) => {
  // expand 字符串
  const expand = messagesExpand

  const pbRes = await pb
    .collection(Collections.Messages)
    .getOne<MessagesResponseWidthExpand>(messageId, {
      expand,
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
  console.log(pbRes)
  return pbRes
}
