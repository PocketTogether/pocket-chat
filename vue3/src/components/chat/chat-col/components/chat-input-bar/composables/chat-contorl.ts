import {
  pbMessagesEditChatApi,
  pbMessagesSendChatApi,
  pbUsersGetByUsernameApi,
} from '@/api'
import { pb } from '@/lib'
import { queryRetryPbNetworkError } from '@/queries'
import { useI18nStore, useRealtimeMessagesStore } from '@/stores'
import {
  executeAsyncTaskWithRetryStrategy,
  potoMessage,
  watchUntilSourceCondition,
} from '@/utils'
import { useMutation } from '@tanstack/vue-query'
import type { ChatInputBarPropsType } from './dependencies'
import type { ChatInputBarDispalyType } from './chat-dispaly'
import type { ChatInputBarDataType } from './chat-data'
import {
  appMessageSendSound,
  chatMessageControlRealtimeWaitTimeoutMsConfig,
  userMessageMentionRegexBulidFn,
  userMessageMentionRegexUsernameIndexNum,
  type PbMessagesMentionMapType,
} from '@/config'
import { useSound } from '@vueuse/sound'

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
    chatImageSelectList,
    chatFileSelectList,
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

  // 【260222】
  // 要一个函数，暂编号为 FN260222162228 （要帮我命名），
  // 参数是 content （字符串）
  // 将返回 mentionedUsers?: string[]; 和 mentionMap?: PbMessagesMentionMapType;
  // 从 content 中处理字符串，正则匹配 (^|\s)(@([a-zA-Z0-9_]{1,32}))($|\s)
  // 得到所有的 $3 之类的，字符串数组，去重，这即是用户名数组
  // 根据此数组的每一项 {
  //   用pbUsersGetByUsernameApi获取用户数据（主要是要id），其能重试
  // }

  /**
   * 【260222】从消息内容中提取 @username，并解析为 PocketBase 所需的
   * mentionedUsers 与 mentionMap。
   *
   * 功能说明：
   * - 使用正则匹配消息文本中的所有 @username（支持多行）
   * - 去重（使用 Set）
   * - 并发调用 pbUsersGetByUsernameApi 查询用户记录
   * - 每个查询都通过 executeAsyncTaskWithRetryStrategy 自动重试网络错误
   * - 使用 Promise.allSettled，确保部分失败不会影响整体
   * - 自动构造：
   *   - mentionedUsers: string[]（userId 数组，用于 PB 关系字段）
   *   - mentionMap: Record<username, userId>（用于 JSON 字段）
   *
   * 设计原则：
   * - 正则只负责“文本层”提取，不做业务判断
   * - 用户查询使用 executeAsyncTaskWithRetryStrategy（纯 TS、框架无关）
   * - 并发执行所有用户查询，提高性能
   * - 使用 Promise.allSettled，保证健壮性（部分失败不影响整体）
   *
   * @param content 消息文本内容
   * @returns { mentionedUsers?: string[], mentionMap?: PbMessagesMentionMapType }
   */
  const extractMentionRelationsFromContent = async (
    content: string
  ): Promise<{
    mentionedUsers?: string[]
    mentionMap?: PbMessagesMentionMapType
  }> => {
    const mentionRegex = userMessageMentionRegexBulidFn()

    const usernamesSet = new Set<string>()

    // 匹配 @username
    const matches = content.matchAll(mentionRegex)

    for (const match of matches) {
      const username = match[userMessageMentionRegexUsernameIndexNum]
      if (username != null) {
        usernamesSet.add(username)
      }
    }

    // 无 @username → 返回空对象
    if (usernamesSet.size === 0) {
      return {}
    }

    // 将 Set 转为数组，避免多次展开
    const usernames = [...usernamesSet]

    // 并发查询所有 username
    const results = await Promise.allSettled(
      usernames.map((username) => {
        return executeAsyncTaskWithRetryStrategy(
          async () => {
            return pbUsersGetByUsernameApi(username)
          },
          {
            shouldRetry: queryRetryPbNetworkError,
          }
        )
      })
    )

    const mentionedUsers: string[] = []
    const mentionMap: PbMessagesMentionMapType = {}

    // 处理查询结果
    results.forEach((res, index) => {
      if (res.status === 'fulfilled' && res.value?.id != null) {
        const username = usernames[index]
        const userId = res.value.id

        mentionedUsers.push(userId)
        mentionMap[username] = userId
      }
    })

    // 若全部失败 → 返回空对象
    if (mentionedUsers.length === 0) {
      return {}
    }

    return {
      mentionedUsers,
      mentionMap,
    }
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

      // 【260222】调用 FN260222162228 取得 mentionedUsers mentionMap
      const { mentionedUsers, mentionMap } =
        await extractMentionRelationsFromContent(chatInputContent.value)

      // 通过 pocketbase SDK 请求
      const pbRes = await pbMessagesSendChatApi({
        content: chatInputContent.value,
        roomId: props.roomId,
        replyMessageId: chatReplyMessage.value?.id,
        images: chatImageSelectList.value.map((i) => i.id),
        file: (() => {
          if (chatFileSelectList.value.length > 0) {
            return chatFileSelectList.value[0].id
          }
          return null
        })(),
        // 【260222】传入
        mentionedUsers,
        mentionMap,
      })
      // console.log(pbRes)
      return pbRes
    },
    // 一些收尾工作
    onSuccess: (data) => {
      // // 发送后重置输入栏
      // chatInputContent.value = ''
      // chatImageSelectList.value = []
      // chatFileSelectList.value = []
      // // 发送后取消刚刚的回复消息
      // chatReplyMessage.value = null

      // 发送后重置输入栏
      chatEditMessageSet(null)
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

  // 消息发送音效
  const messageSendSound = useSound(appMessageSendSound, { volume: 0.25 })
  // 消息发送提交
  const messageSendSubmit = async () => {
    if (
      chatInputContent.value.trim() === '' &&
      chatImageSelectList.value.length <= 0 &&
      chatFileSelectList.value.length <= 0
    ) {
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
      // 发送成功，播放发送音效
      // if (raceResults === 'normal') {
      else {
        messageSendSound.play()
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

      // 【260222】调用 FN260222162228 取得 mentionedUsers mentionMap
      const { mentionedUsers, mentionMap } =
        await extractMentionRelationsFromContent(chatInputContent.value)

      // 通过 pocketbase SDK 请求
      const pbRes = await pbMessagesEditChatApi({
        chatEditMessageId: chatEditMessage.value.id,
        content: chatInputContent.value,
        replyMessageId: chatReplyMessage.value?.id,
        images: chatImageSelectList.value.map((i) => i.id),
        file: (() => {
          if (chatFileSelectList.value.length > 0) {
            return chatFileSelectList.value[0].id
          }
          return null
        })(),
        // 【260222】传入
        mentionedUsers,
        mentionMap,
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
    if (
      chatInputContent.value.trim() === '' &&
      chatImageSelectList.value.length <= 0 &&
      chatFileSelectList.value.length <= 0
    ) {
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
