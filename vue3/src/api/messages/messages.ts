import { chatMessageRealtimeReConnectListNumberConfig } from '@/config'
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
  /** 发送图片 */
  images: string[]
  /** 发送文件 */
  file: string | null
}) => {
  const { roomId, content, replyMessageId, images, file } = data

  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 文件、图片、内容互斥，优先发送图片消息
  const { processedContent, processedImages, processedFile } = (() => {
    // images
    if (images.length > 0) {
      return {
        processedContent: '',
        processedImages: images,
        processedFile: '',
      }
    }
    // file
    else if (file != null && file !== '') {
      return {
        processedContent: '',
        processedImages: [],
        processedFile: file,
      }
    }
    // content
    else {
      return {
        processedContent: content,
        processedImages: [],
        processedFile: '',
      }
    }
  })()

  // 准备数据
  const createData: Create<Collections.Messages> = {
    author: pb.authStore.record.id,
    content: processedContent,
    images: processedImages,
    file: processedFile,
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
  /** 发送图片 */
  images: string[]
  /** 发送文件 */
  file: string | null
}) => {
  const { chatEditMessageId, content, images, replyMessageId, file } = data

  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 文件、图片、内容互斥，优先发送图片消息
  const { processedContent, processedImages, processedFile } = (() => {
    // images
    if (images.length > 0) {
      return {
        processedContent: '',
        processedImages: images,
        processedFile: '',
      }
    }
    // file
    else if (file != null && file !== '') {
      return {
        processedContent: '',
        processedImages: [],
        processedFile: file,
      }
    }
    // content
    else {
      return {
        processedContent: content,
        processedImages: [],
        processedFile: '',
      }
    }
  })()

  // 准备数据
  const updateData: Update<Collections.Messages> = {
    content: processedContent,
    images: processedImages,
    file: processedFile,
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
  // console.log(pbRes)
  return pbRes
}

/** 消息实时订阅连接时，用于断线重连补偿的请求，请求最新的几条消息 */
export const pbMessagesRealtimeReConnectListApi = async () => {
  // expand 字符串
  const expand = messagesExpand
  // 类型安全地构造 sort 字符串
  const sort = (() => {
    const recordKeys = {
      created: 'created',
      id: 'id',
    } as const satisfies Group<Partial<KeyValueMirror<keyof MessagesRecord>>>
    // 日期降序，（日期相同时）id升序
    // type const = "-created,id"
    return `-${recordKeys.created},${recordKeys.id}` as const
  })()

  const pbRes = await pb
    .collection(Collections.Messages)
    .getList<MessagesResponseWidthExpand>(
      1,
      chatMessageRealtimeReConnectListNumberConfig,
      {
        expand,
        sort,
        skipTotal: true,
        // timeout为5000
        fetch: fetchWithTimeoutPreferred,
      }
    )
  // console.log('pbMessagesRealtimeReConnectListApi', pbRes)
  return pbRes
}
