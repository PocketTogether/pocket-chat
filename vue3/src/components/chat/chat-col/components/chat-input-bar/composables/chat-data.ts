import {
  type ImagesResponseWithBaseExpand,
  type MessagesResponseWidthExpand,
  type MessagesResponseWidthExpandReplyMessage,
} from '@/api'
import type { ChatInputBarPropsType } from './dependencies'
import { useSelectionImageStore } from '@/stores'

// 封装 聊天输入栏数据逻辑
// useChatInputBarData
export const useChatInputBarData = (data: {
  //
  props: ChatInputBarPropsType
}) => {
  const {
    //
    props,
  } = data

  // 聊天输入框内容
  const chatInputContent = ref('')

  // 图片选择内容
  const chatImageSelectList = ref<ImagesResponseWithBaseExpand[]>([])

  // 回复的消息，将导出给外部组件使用
  const chatReplyMessage = ref<MessagesResponseWidthExpandReplyMessage | null>(
    null
  )
  const chatReplyMessageSet = (
    val: MessagesResponseWidthExpandReplyMessage | null
  ) => {
    chatReplyMessage.value = val
  }

  // 修改的消息，将导出给外部组件使用
  const chatEditMessage = ref<MessagesResponseWidthExpand | null>(null)
  const chatEditMessageSet = (val: MessagesResponseWidthExpand | null) => {
    if (val == null) {
      chatEditMessage.value = null
      chatInputContent.value = ''
      chatReplyMessage.value = null
      chatImageSelectList.value = []
    } else {
      chatEditMessage.value = val
      chatInputContent.value = val.content
      chatReplyMessage.value = val.expand?.replyMessage ?? null
      chatImageSelectList.value = val.expand?.images ?? []
    }
  }

  /**
   * 消息发送后是否出现了实时网络问题状态
   * 发送、修改、删除 消息后实时等待超时，将设置为true
   * 聊天刷新（重置）后，将设置为false
   */
  const chatMessageIsRealtimeTimeout = ref(false)
  const chatMessageIsRealtimeTimeoutSet = (val: boolean) => {
    chatMessageIsRealtimeTimeout.value = val
  }

  const { chooseInitialization, chatColPageRecoverData } =
    props.chatDisplayDependentDataInitializationChoose

  // 输入栏内容 回复消息 初始化
  // 根据“页面恢复数据”初始化
  if (
    chooseInitialization === 'chatColPageRecoverData' &&
    chatColPageRecoverData != null &&
    // 判断 “页面恢复数据” 是否正确，正确才进行此方式的初始化
    props.chatColPageRecoverDataCheck === true
  ) {
    chatInputContent.value = chatColPageRecoverData.data.chatInputContent
    chatImageSelectList.value = chatColPageRecoverData.data.chatImageSelectList
    chatReplyMessage.value = chatColPageRecoverData.data.chatReplyMessage
    chatEditMessage.value = chatColPageRecoverData.data.chatEditMessage
    chatMessageIsRealtimeTimeout.value =
      chatColPageRecoverData.data.chatMessageIsRealtimeTimeout
  }
  // 正常的初始化
  else {
    // 无
  }

  // 图片选择数据接收，必须在“页面恢复数据”初始化之后，以覆盖其
  const selectionImageStore = useSelectionImageStore()
  const selectionImageGetData = selectionImageStore.getAndClear()
  if (selectionImageGetData != null) {
    chatImageSelectList.value = selectionImageGetData
  }

  return {
    //
    chatInputContent,
    chatImageSelectList,
    chatReplyMessage,
    chatReplyMessageSet,
    chatEditMessage,
    chatEditMessageSet,
    chatMessageIsRealtimeTimeout,
    chatMessageIsRealtimeTimeoutSet,
  }
}
export type ChatInputBarDataType = ReturnType<typeof useChatInputBarData>
