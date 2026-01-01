import type {
  MessagesResponseWidthExpand,
  MessagesResponseWidthExpandReplyMessage,
} from '@/api'
import type { ChatRoomMessagesItem } from '@/components'
import {
  chatRoomMessagesTwowayPositioningCursorRouterQueryParametersKeyConfig,
  routerDict,
} from '@/config'
import type { MessagesResponse } from '@/lib'
import { useProfileQuery } from '@/queries'
import { useAuthStore, useI18nStore } from '@/stores'
import { potoNotification, urlJoinWithOriginUtil } from '@/utils'
import { useClipboard } from '@vueuse/core'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'

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
      return messageData.value.expand?.author
    }
    // 为当前用户
    // profileQuery 为 null，可能为加载中，返回原数据
    if (profileQuery.data.value == null) {
      return messageData.value.expand?.author
    }

    // messageData.value.expand.author为null是不正常的
    if (messageData.value.expand?.author == null) {
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

/** 消息链接处理相关，复制消息链接 */
export const useMessageLinkProcess = (data: {
  messageData: ComputedRef<MessagesResponse | null | undefined>
}) => {
  const { messageData } = data

  const router = useRouter()
  const route = useRoute()

  const clipboard = useClipboard()
  const i18nStore = useI18nStore()

  // 路由跳转或处理所需的对象
  const messageRouterResolveObj = computed(() => {
    // 无数据，是不正常的，返回
    if (messageData.value == null) {
      console.error('messageData.value == null')
      return undefined
    }

    const { id: keyId, created: keyCreated } =
      chatRoomMessagesTwowayPositioningCursorRouterQueryParametersKeyConfig

    // 【pocket-together】对于多房间，要还要处理房间id
    return {
      name: routerDict.ChatHome.name,
      query: {
        [keyId]: messageData.value.id,
        [keyCreated]: messageData.value.created,
      },
    } as const satisfies RouteLocationRaw
  })

  /** 复制消息链接 */
  const copyMessageLink = async () => {
    // 无数据，是不正常的，返回
    if (messageData.value == null) {
      console.error('messageData.value == null')
      return
    }
    if (messageRouterResolveObj.value == null) {
      return
    }

    // 生成链接但不跳转
    const resolved = router.resolve(messageRouterResolveObj.value)

    // 拼接网址链接
    const link = urlJoinWithOriginUtil(window.location.origin, resolved.href)
    // console.log(link)

    // 浏览支持复制
    if (clipboard.isSupported.value) {
      try {
        await clipboard.copy(link)
        potoNotification({
          type: 'success',
          title: i18nStore.t(
            'chatMessageInfoDialogCopyMessageLinkSuccessTitle'
          )(),
          message: link,
        })
      } catch (error) {
        potoNotification({
          type: 'warning',
          title: i18nStore.t(
            'chatMessageInfoDialogCopyMessageLinkNotSupportedTitle'
          )(),
          message: link,
        })
      }
    }
    // 浏览器不支持复制
    else {
      potoNotification({
        type: 'warning',
        title: i18nStore.t(
          'chatMessageInfoDialogCopyMessageLinkNotSupportedTitle'
        )(),
        message: link,
      })
    }
  }

  return {
    copyMessageLink,
    messageRouterResolveObj,
  }
}
