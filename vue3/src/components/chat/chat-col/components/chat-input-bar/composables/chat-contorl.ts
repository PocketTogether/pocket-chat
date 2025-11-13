import { pbMessagesEditChatApi, pbMessagesSendChatApi } from '@/api'
import { pb } from '@/lib'
import { queryRetryPbNetworkError } from '@/queries'
import { useI18nStore, useRealtimeMessagesStore } from '@/stores'
import { potoMessage, watchUntilSourceCondition } from '@/utils'
import { useMutation } from '@tanstack/vue-query'
import type { ChatInputBarPropsType } from './dependencies'
import type { ChatInputBarDispalyType } from './chat-dispaly'
import type { ChatInputBarDataType } from './chat-data'
import { chatMessageControlRealtimeWaitTimeoutMsConfig } from '@/config'

// 封装 聊天输入栏的操作逻辑
// useChatInputBarControl
export const useChatInputBarControl = (
  data: {
    //
    props: ChatInputBarPropsType
  } & ChatInputBarDataType &
    ChatInputBarDispalyType
) => {
  const {
    //
    props,
    chatInputContent,
    chatReplyMessage,
    chatEditMessage,
    chatEditMessageSet,
    messageSendSubmitRunning,
    messageEditSubmitRunning,
    chatInputBarFunctionChoose,
    chatMessageIsRealtimeTimeoutSet,
  } = data

  // 取消回复消息
  const chatReplyMessageCancel = () => {
    chatReplyMessage.value = null
  }

  /** 回复消息定位 */
  const replyMessagesPositioningFn = async () => {
    // 无回复消息，直接返回
    if (chatReplyMessage.value == null) {
      return
    }
    await props.chatRoomMessagesReplyPositioningFn(
      {
        id: chatReplyMessage.value.id,
        created: chatReplyMessage.value.created,
      },
      false
    )
  }

  const i18nStore = useI18nStore()

  const realtimeMessagesStore = useRealtimeMessagesStore()
  // 消息发送Mutation
  const messageSendMutation = useMutation({
    // mutation函数
    mutationFn: async () => {
      // 未登录，抛出错误
      if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
        throw new Error(
          '!pb.authStore.isValid || pb.authStore.record?.id == null'
        )
      }

      // 通过 pocketbase SDK 请求
      const pbRes = await pbMessagesSendChatApi({
        content: chatInputContent.value,
        roomId: props.roomId,
        replyMessageId: chatReplyMessage.value?.id,
      })
      // console.log(pbRes)
      return pbRes
    },
    // 一些收尾工作
    onSuccess: (data) => {
      // 发送后重置输入栏
      chatInputContent.value = ''
      // 发送后取消刚刚的回复消息
      chatReplyMessage.value = null
    },
    // 错误处理
    onError: (error) => {
      potoMessage({
        type: 'error',
        message: i18nStore.t('chatMessageSendErrorText')(),
      })
    },
    // 此接口非幂等，不重试，避免重复发送
    // // ✅ 在网络错误时重试
    // retry: queryRetryPbNetworkError,
  })

  // 消息发送提交
  const messageSendSubmit = async () => {
    if (chatInputContent.value.trim() === '') {
      return
    }
    if (messageSendSubmitRunning.value === true) {
      return
    }
    messageSendSubmitRunning.value = true
    try {
      const resData = await messageSendMutation.mutateAsync()
      // 【251112】网络问题
      const raceResults = await Promise.race([
        // 实时消息等待逻辑
        (async () => {
          // 发送后，仍应等待realtime收到自己发的消息
          await watchUntilSourceCondition(
            computed(
              () =>
                realtimeMessagesStore.createList.find(
                  (i) => i.id === resData.id
                ) != null
            ),
            (val) => val === true
          )
          // 返回 normal 代表正常
          return 'normal' as const
        })(),
        // 实时消息等待超时
        (async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, chatMessageControlRealtimeWaitTimeoutMsConfig)
          )
          // 返回 timeout 代表超时
          return 'timeout' as const
        })(),
      ])
      // 结果为超时，进行设置
      if (raceResults === 'timeout') {
        potoMessage({
          type: 'warning',
          message: i18nStore.t('chatMessageRealtimeWaitTimeoutErrorText')(),
        })
        chatMessageIsRealtimeTimeoutSet(true)
      }
    } finally {
      messageSendSubmitRunning.value = false
    }
  }

  // 消息编辑Mutation
  const messageEditMutation = useMutation({
    // mutation函数
    mutationFn: async () => {
      // 未登录，抛出错误
      if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
        throw new Error(
          '!pb.authStore.isValid || pb.authStore.record?.id == null'
        )
      }
      // 无chatEditMessage.value，抛出错误
      if (chatEditMessage.value == null) {
        throw new Error('chatEditMessage.value == null')
      }

      // 通过 pocketbase SDK 请求
      const pbRes = await pbMessagesEditChatApi({
        chatEditMessageId: chatEditMessage.value.id,
        content: chatInputContent.value,
        replyMessageId: chatReplyMessage.value?.id,
      })
      // console.log(pbRes)
      return pbRes
    },
    // 一些收尾工作
    onSuccess: (data) => {
      // 发送后重置输入栏
      chatEditMessageSet(null)
    },
    // 错误处理
    onError: (error) => {
      potoMessage({
        type: 'error',
        message: i18nStore.t('chatMessageEditErrorText')(),
      })
    },
    // // 此接口幂等，可重试
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  // 消息编辑提交
  const messageEditSubmit = async () => {
    if (chatInputContent.value.trim() === '') {
      return
    }
    if (messageEditSubmitRunning.value === true) {
      return
    }
    messageEditSubmitRunning.value = true
    try {
      const resData = await messageEditMutation.mutateAsync()

      // 【251112】网络问题
      const raceResults = await Promise.race([
        // 实时消息等待逻辑
        (async () => {
          // 发送后，仍应等待realtime收到更新情况
          await watchUntilSourceCondition(
            computed(() => {
              const find = realtimeMessagesStore.updateList.find((i) => {
                // 需消息id与updated更新时间才能确认是此次更新
                return i.id === resData.id && i.updated === resData.updated
              })
              return find != null
            }),
            (val) => val === true
          )
          // 返回 normal 代表正常
          return 'normal' as const
        })(),
        // 实时消息等待超时
        (async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, chatMessageControlRealtimeWaitTimeoutMsConfig)
          )
          // 返回 timeout 代表超时
          return 'timeout' as const
        })(),
      ])
      // 结果为超时，进行设置
      if (raceResults === 'timeout') {
        potoMessage({
          type: 'warning',
          message: i18nStore.t('chatMessageRealtimeWaitTimeoutErrorText')(),
        })
        chatMessageIsRealtimeTimeoutSet(true)
      }
    } finally {
      messageEditSubmitRunning.value = false
    }
  }

  // 消息编辑取消
  const messageEditCancel = () => {
    chatEditMessageSet(null)
  }

  // 输入栏回车的处理
  const handleChatInputKeydownEnter = (event: Event | KeyboardEvent) => {
    // console.log('回车触发:', chatInputContent.value)

    if (chatInputBarFunctionChoose.value === 'send') {
      messageSendSubmit()
    } else if (chatInputBarFunctionChoose.value === 'edit') {
      messageEditSubmit()
    }
  }

  return {
    //
    chatReplyMessageCancel,
    replyMessagesPositioningFn,
    messageSendSubmit,
    messageEditSubmit,
    messageEditCancel,
    handleChatInputKeydownEnter,
  }
}
export type ChatInputBarControlType = ReturnType<typeof useChatInputBarControl>
