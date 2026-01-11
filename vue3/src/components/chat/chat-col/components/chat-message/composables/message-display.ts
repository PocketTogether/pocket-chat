import {
  appUserDefaultAvatar,
  chatRoomMessagesDispalyTogetherMaxSecondsConfig,
  fileUserAvatarConfig,
} from '@/config'
import type { ChatMessagePropsType, ChatRoomMessagesItem } from './dependencies'
import { useAuthStore, useI18nStore } from '@/stores'
import { compareDatesSafeGetSecondsBetween } from '@/utils'
import { pb } from '@/lib'
import { useTimeAgo } from '@vueuse/core'
import type { MessagesResponseWidthExpand } from '@/api'
import { useCurrentMessageUserDataOptimization } from '@/composables'

// 封装 消息的显示逻辑
export const useMessageDisplay = (data: {
  //
  props: ChatMessagePropsType
  currentMessageData: ComputedRef<MessagesResponseWidthExpand>
}) => {
  const {
    //
    props,
    currentMessageData,
  } = data

  // 响应式的 pb.authStore
  const authStore = useAuthStore()

  const {
    /** 当前消息是否为当前用户发送 */
    isMessageCurrentUser,
    /** 如果当前消息为当前用户，则判断消息中的用户数据 与 profileQuery中的用户数据哪个更新，采用更新的数据 */
    currentMessageUserData,
  } = useCurrentMessageUserDataOptimization({
    messageData: currentMessageData,
  })

  /**
   * 判断两条消息是否一起显示
   * ```
   * 两条为同一用户，且相差时间不超过配置值，即一起显示
   * ```
   */
  const determineMessagesDispalyTogetherFn = (
    messagesItem1: ChatRoomMessagesItem | null,
    messagesItem2: ChatRoomMessagesItem | null
  ) => {
    // 无消息，即为false
    if (messagesItem1 == null || messagesItem2 == null) {
      return false
    }
    // 不是同一用户，即为false
    if (messagesItem1.author !== messagesItem2.author) {
      return false
    }
    // 相差时间超过配置值（或日期问题null），即为false
    const messageBetweenSeconds = compareDatesSafeGetSecondsBetween(
      messagesItem1.created,
      messagesItem2.created
    )
    if (messageBetweenSeconds == null) {
      return false
    }
    if (
      // 绝对值 Math.abs 保证结果为正数
      Math.abs(messageBetweenSeconds) >
      chatRoomMessagesDispalyTogetherMaxSecondsConfig
    ) {
      return false
    }
    // 通过以上检查，即为true
    return true
  }

  /**
   * 是否和上消息一起显示
   * ```
   * 不显示消息气泡框上方头像侧圆角
   * ```
   */
  const isMessagesDispalyTogetherPrevious = computed(() => {
    return determineMessagesDispalyTogetherFn(
      props.chatRoomMessagesItem,
      props.chatRoomMessagesItemPrevious
    )
  })

  /**
   * 是否和下一条消息一起显示
   * ```
   * 不显示头像和名称
   * 不显示消息气泡框下方头像侧圆角
   * ```
   */
  const isMessagesDispalyTogetherNext = computed(() => {
    return determineMessagesDispalyTogetherFn(
      props.chatRoomMessagesItem,
      props.chatRoomMessagesItemNext
    )
  })

  // 控制圆角显示
  const isMessageBoxroundedTL = computed(() => {
    if (isMessageCurrentUser.value) {
      return true
    } else {
      if (isMessagesDispalyTogetherPrevious.value) {
        return false
      } else {
        return true
      }
    }
  })
  const isMessageBoxroundedTR = computed(() => {
    if (isMessageCurrentUser.value) {
      if (isMessagesDispalyTogetherPrevious.value) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  })
  const isMessageBoxroundedBL = computed(() => {
    if (isMessageCurrentUser.value) {
      return true
    } else {
      if (isMessagesDispalyTogetherNext.value) {
        return false
      } else {
        return true
      }
    }
  })
  const isMessageBoxroundedBR = computed(() => {
    if (isMessageCurrentUser.value) {
      if (isMessagesDispalyTogetherNext.value) {
        return false
      } else {
        return true
      }
    } else {
      return true
    }
  })

  // 头像
  const messageUserAvatarUrl = computed(() => {
    // expand.author == null 这是异常（可能pb配置或前端api调用有误），但不抛错了，返回默认头像算了
    if (currentMessageUserData.value == null) {
      console.error('currentMessageData.value.expand.author == null')
      return appUserDefaultAvatar
    }
    // 无头像，返回默认头像
    if (currentMessageUserData.value.avatar === '') {
      return appUserDefaultAvatar
    }
    // 有头像，返回头像url
    return pb.files.getURL(
      currentMessageUserData.value,
      currentMessageUserData.value.avatar,
      { thumb: fileUserAvatarConfig.thumb200x200 }
    )
  })

  // 用户名
  const messageUserName = computed(() => {
    // expand.author == null 这是异常（可能pb配置或前端api调用有误），但不抛错了，返回空字符串算了
    if (currentMessageUserData.value == null) {
      console.error('currentMessageData.value.expand.author == null')
      return ''
    }
    // 无名称，返回用户名
    if (currentMessageUserData.value.name === '') {
      return currentMessageUserData.value.username
    }
    // 有名称，返回名称
    return currentMessageUserData.value.name
  })

  const i18nStore = useI18nStore()

  // 时间
  const timeAgo = useTimeAgo(
    computed(() => currentMessageData.value.created),
    {
      // i18n
      messages: i18nStore.t('useTimeAgoMessages')(),
      max: 'day',
    }
  )

  const { currentMessageUserData: replyMessageUserData } =
    useCurrentMessageUserDataOptimization({
      messageData: computed(
        () => currentMessageData.value.expand?.replyMessage
      ),
    })

  // 回复的消息的用户头像
  const messageReplyMessageUserAvatarUrl = computed(() => {
    // expand.replyMessage == null，此情况不会显示，返回默认头像
    if (replyMessageUserData.value == null) {
      return appUserDefaultAvatar
    }

    // expand.author == null 这是异常（可能pb配置或前端api调用有误），但不抛错了，返回默认头像算了
    if (replyMessageUserData.value == null) {
      console.error('currentMessageData.value.expand.author == null')
      return appUserDefaultAvatar
    }
    // 无头像，返回默认头像
    if (replyMessageUserData.value.avatar === '') {
      return appUserDefaultAvatar
    }
    // 有头像，返回头像url
    return pb.files.getURL(
      replyMessageUserData.value,
      replyMessageUserData.value.avatar,
      { thumb: fileUserAvatarConfig.thumb200x200 }
    )
  })

  return {
    //
    isMessageCurrentUser,
    isMessagesDispalyTogetherNext,
    isMessageBoxroundedTL,
    isMessageBoxroundedTR,
    isMessageBoxroundedBL,
    isMessageBoxroundedBR,
    messageUserAvatarUrl,
    messageUserName,
    timeAgo,
    messageReplyMessageUserAvatarUrl,
  }
}
