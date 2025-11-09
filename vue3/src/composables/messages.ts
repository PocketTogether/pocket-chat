import type {
  MessagesResponseWidthExpand,
  MessagesResponseWidthExpandReplyMessage,
} from '@/api'
import type { ChatRoomMessagesItem } from '@/components'
import { useProfileQuery } from '@/queries'
import { useAuthStore } from '@/stores'

/**
 * 优化当前用户消息的用户信息，使修改自己的头像、名称等信息后，返回聊天页时不必再刷新就是已修改的
 *
 * 如果当前消息为当前用户，则判断消息中的用户数据 与 profileQuery中的用户数据哪个更新，采用更新的数据
 */
export const useCurrentMessageUserDataOptimization = (data: {
  messageData: ComputedRef<
    | MessagesResponseWidthExpand
    | MessagesResponseWidthExpandReplyMessage
    | null
    | undefined
  >
}) => {
  const {
    //
    messageData,
  } = data

  const authStore = useAuthStore()
  const profileQuery = useProfileQuery()

  /** 消息是否为当前用户发送判断函数 */
  const determineMessageCurrentUserFn = (
    messagesItem: ChatRoomMessagesItem | null | undefined
  ) => {
    // 消息为null，即为false
    if (messagesItem == null) {
      return false
    }
    // 未登录，即为false
    if (!authStore.isValid || authStore.record == null) {
      return false
    }
    // 消息为当前用户发送
    if (messagesItem.author === authStore.record.id) {
      return true
    }
    return false
  }

  /** 当前消息是否为当前用户发送 */
  const isMessageCurrentUser = computed(() =>
    determineMessageCurrentUserFn(messageData.value)
  )

  // 如果当前消息为当前用户，则判断消息中的用户数据 与 profileQuery中的用户数据哪个更新，采用更新的数据
  const currentMessageUserData = computed(() => {
    // 消息为null，返回undefined
    if (messageData.value == null) {
      return undefined
    }

    // 非当前用户，返回原数据中的用户数据
    if (!isMessageCurrentUser.value) {
      return messageData.value.expand.author
    }
    // 为当前用户
    // profileQuery 为 null，可能为加载中，返回原数据
    if (profileQuery.data.value == null) {
      return messageData.value.expand.author
    }

    // messageData.value.expand.author为null是不正常的
    if (messageData.value.expand.author == null) {
      console.error('messageData.value.expand.author == null')
      return undefined
    }

    // 比较updated，是否profile中的更新，是则使用profileQuery，否则使用messageData
    if (
      profileQuery.data.value.updated > messageData.value.expand.author.updated
    ) {
      return profileQuery.data.value
    }
    return messageData.value.expand.author
  })

  return {
    isMessageCurrentUser,
    currentMessageUserData,
  }
}
