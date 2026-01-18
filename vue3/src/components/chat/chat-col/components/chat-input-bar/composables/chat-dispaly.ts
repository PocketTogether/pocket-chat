import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import { pb } from '@/lib'
import { onClickOutside } from '@vueuse/core'
import type { ElButton } from 'element-plus'
import {
  useAutoCyclicValue,
  useCurrentMessageUserDataOptimization,
  useUserPermissionsDesuwa,
} from '@/composables'
import type { ChatInputBarDataType } from './chat-data'
import type { ChatInputBarPropsType } from './dependencies'
import { useAuthStore } from '@/stores'

// 封装 聊天输入栏显示逻辑
// useChatInputBarDispaly
export const useChatInputBarDispaly = (
  data: {
    //
    props: ChatInputBarPropsType
  } & ChatInputBarDataType
) => {
  const {
    //
    props,
    chatInputContent,
    chatImageSelectList,
    chatFileSelectList,
    chatReplyMessage,
    chatEditMessage,
    chatMessageIsRealtimeTimeout,
  } = data

  const messageSendSubmitRunning = ref(false)
  const messageEditSubmitRunning = ref(false)

  const { currentMessageUserData: charReplyMessageUserData } =
    useCurrentMessageUserDataOptimization({
      messageData: computed(() => chatReplyMessage.value),
    })

  // 回复的消息的用户头像
  const chatReplyMessageUserAvatarUrl = computed(() => {
    // chatReplyMessage.value == null，此情况不会显示，返回默认头像
    if (chatReplyMessage.value == null) {
      return appUserDefaultAvatar
    }

    // expand.author == null 这是异常（可能pb配置或前端api调用有误），但不抛错了，返回默认头像算了
    if (charReplyMessageUserData.value == null) {
      console.error('props.chatRoomMessagesItem.expand.author == null')
      return appUserDefaultAvatar
    }
    // 无头像，返回默认头像
    if (charReplyMessageUserData.value.avatar === '') {
      return appUserDefaultAvatar
    }
    // 有头像，返回头像url
    return pb.files.getURL(
      charReplyMessageUserData.value,
      charReplyMessageUserData.value.avatar,
      { thumb: fileUserAvatarConfig.thumb200x200 }
    )
  })

  const authStore = useAuthStore()

  const { permissionSendMessage, openPermissionAdminContactNotif } =
    useUserPermissionsDesuwa()

  // 输入栏不同功能判断
  // error 消息query失败或消息实时等待超时时，网路问题，请重试
  // login 未登录时，显示登录按钮
  // menu 正常状时为 输入栏+菜单按钮
  // send 输入文字（或设置回复）后为 输入栏+发送按钮
  // edit 编辑 chatEditMessage 不为null时为，输入栏+编辑按钮组
  // backTop 距底部距离大于大于一定值后为 回到底部文字+按钮
  const chatInputBarFunctionChoose = computed(() => {
    // error 消息query失败或消息实时等待超时时，网路问题，请重试
    if (
      chatMessageIsRealtimeTimeout.value === true ||
      props.chatMessageQueryisNullAndError === true
    ) {
      return 'error' as const
    }

    // login 未登录时，显示登录按钮，backTop还会根据情况显示
    if (authStore.isValid === false) {
      if (props.chatBackBottomDisplayable === true) {
        return 'backBottom' as const
      } else {
        return 'login' as const
      }
    }

    // noPermissionSendMessage 无发送消息权限
    // 显示权限提示按钮，backTop还会根据情况显示
    if (permissionSendMessage.value === false) {
      if (props.chatBackBottomDisplayable === true) {
        return 'backBottom' as const
      } else {
        return 'noPermissionSendMessage' as const
      }
    }

    // edit 编辑 chatEditMessage 不为null时为，输入栏+编辑按钮组
    if (chatEditMessage.value != null || messageEditSubmitRunning.value) {
      return 'edit'
    }
    // send 输入文字后，或正处于发送中，为 输入栏+发送按钮
    // 【251222】图片选择后，也为send
    if (
      chatImageSelectList.value.length > 0 ||
      chatFileSelectList.value.length > 0 ||
      chatInputContent.value !== '' ||
      messageSendSubmitRunning.value
    ) {
      return 'send' as const
    }
    // backTop 底部仍有未显示的消息，或距底部距离大于大于一定值后为 回到底部文字+按钮
    // 且应没有正在回复的消息（正在回复消息时则不显示 backTop）
    if (
      props.chatBackBottomDisplayable === true &&
      chatReplyMessage.value == null
    ) {
      return 'backBottom' as const
    }
    // menu 正常状时为 输入栏+菜单按钮
    return 'menu' as const
  })

  // 实现回到底部和新消息提示循环闪烁显示，间隔 2000ms
  const autoCyclicValueToShowNewMessageAndBackBottom = useAutoCyclicValue(
    ['NewMessage', 'BackBottom'] as const,
    2000
  )
  // 是否有新消息
  const isHaveNewMessage = computed(() => {
    if (props.chatRoomMessagesRealtimeUnReadNumber > 0) {
      return true
    }
    return false
  })

  // 展开菜单
  const isShowMoreMenu = ref(false)
  const openMoreMenu = () => {
    isShowMoreMenu.value = true
  }
  const closeMoreMenu = () => {
    isShowMoreMenu.value = false
  }
  const toggleShowMoreMenu = () => {
    isShowMoreMenu.value = !isShowMoreMenu.value
  }
  // 当菜单展开时，点击菜单外部可以关闭菜单
  const targetMoreMenu = useTemplateRef<HTMLElement>('targetMoreMenu')
  const targetMoreMenuToggleShowButtonEl = useTemplateRef<
    InstanceType<typeof ElButton>
  >('targetMoreMenuToggleShowButtonEl')
  const targetMoreMenuToggleShowButton = computed(() => {
    if (targetMoreMenuToggleShowButtonEl.value == null) {
      return null
    }
    return targetMoreMenuToggleShowButtonEl.value.$el as HTMLElement
  })
  onClickOutside(targetMoreMenu, (event) => {
    // console.log(event)
    // 菜单未打开，直接返回
    if (targetMoreMenu == null || isShowMoreMenu.value === false) {
      return
    }
    // 点击正好是在菜单开关按钮上，直接返回
    if (
      targetMoreMenuToggleShowButton.value != null &&
      targetMoreMenuToggleShowButton.value?.contains(event.target as Node)
    ) {
      return
    }
    closeMoreMenu()
  })

  return {
    //
    messageSendSubmitRunning,
    messageEditSubmitRunning,
    chatReplyMessageUserAvatarUrl,
    chatInputBarFunctionChoose,
    autoCyclicValueToShowNewMessageAndBackBottom,
    isHaveNewMessage,
    isShowMoreMenu,
    closeMoreMenu,
    toggleShowMoreMenu,
    targetMoreMenu,
    targetMoreMenuToggleShowButtonEl,
    openPermissionAdminContactNotif,
  }
}
export type ChatInputBarDispalyType = ReturnType<typeof useChatInputBarDispaly>
