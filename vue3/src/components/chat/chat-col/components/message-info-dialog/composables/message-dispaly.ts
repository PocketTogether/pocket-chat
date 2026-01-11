import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import { pb } from '@/lib'
import { useChatRoomMessagesGetOneQuery } from '@/queries'
import { useAuthStore } from '@/stores'
import type { MessageInfoDialogPropsType } from './dependencies'
import { useCurrentMessageUserDataOptimization } from '@/composables'

export const useMessageDispaly = (data: {
  //
  props: MessageInfoDialogPropsType
}) => {
  const {
    //
    props,
  } = data

  // 还是通过普通的ref设置dialogMessageId比较好
  const dialogMessageId = ref<string | null>(null)

  // dialogMessageId 初始化
  const { chooseInitialization, chatColPageRecoverData } =
    props.chatDisplayDependentDataInitializationChoose
  // 根据“页面恢复数据”初始化
  if (
    chooseInitialization === 'chatColPageRecoverData' &&
    chatColPageRecoverData != null &&
    // 判断 “页面恢复数据” 是否正确，正确才进行此方式的初始化
    props.chatColPageRecoverDataCheck === true
  ) {
    dialogMessageId.value = chatColPageRecoverData.data.dialogMessageId
  }
  // 正常的初始化
  else {
    // 无
  }

  // 当前消息数据 useChatRoomMessagesGetOneQuery
  const chatRoomMessagesGetOneQuery = useChatRoomMessagesGetOneQuery({
    messageId: computed(() => dialogMessageId.value),
  })

  const {
    /** 当前消息是否为当前用户发送 */
    isMessageCurrentUser: isMessageSendByCurrentUser,
    /** 如果当前消息为当前用户，则判断消息中的用户数据 与 profileQuery中的用户数据哪个更新，采用更新的数据 */
    currentMessageUserData,
  } = useCurrentMessageUserDataOptimization({
    messageData: computed(() => chatRoomMessagesGetOneQuery.data.value),
  })

  // 头像
  const messageUserAvatarUrl = computed(() => {
    // 无数据，返回默认头像（其实无数据时根本不会用到头像，返回默认头像是为了使其类型方便）
    if (chatRoomMessagesGetOneQuery.data.value == null) {
      return appUserDefaultAvatar
    }
    // expand.author == null 这是异常（可能pb配置或前端api调用有误），但不抛错了，返回默认头像算了
    if (currentMessageUserData.value == null) {
      console.error('currentMessageUserData.value == null')
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

  // 名称
  const messageUserName = computed(() => {
    // 无数据，返回空字符串
    if (chatRoomMessagesGetOneQuery.data.value == null) {
      return ''
    }
    // expand.author == null 这是异常（可能pb配置或前端api调用有误），但不抛错了，返回空字符串算了
    if (currentMessageUserData.value == null) {
      console.error('currentMessageUserData.value == null')
      return ''
    }
    // 无名称，返回用户名
    if (currentMessageUserData.value.name === '') {
      return currentMessageUserData.value.username
    }
    // 有名称，返回名称
    return currentMessageUserData.value.name
  })

  // 用户名
  const messageUserUsername = computed(
    () => currentMessageUserData.value?.username ?? ''
  )

  const { currentMessageUserData: replyMessageUserData } =
    useCurrentMessageUserDataOptimization({
      messageData: computed(
        () => chatRoomMessagesGetOneQuery.data.value?.expand?.replyMessage
      ),
    })

  // 回复的消息的用户头像
  const messageReplyMessageUserAvatarUrl = computed(() => {
    // 无数据，返回默认头像（其实无数据时根本不会用到头像，返回默认头像是为了使其类型方便）
    if (chatRoomMessagesGetOneQuery.data.value == null) {
      return appUserDefaultAvatar
    }

    // expand.author == null 这是异常（可能pb配置或前端api调用有误），但不抛错了，返回默认头像算了
    if (replyMessageUserData.value == null) {
      console.error('replyMessageUserData.value == null')
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
    dialogMessageId,
    chatRoomMessagesGetOneQuery,
    messageUserAvatarUrl,
    messageUserName,
    messageUserUsername,
    messageReplyMessageUserAvatarUrl,
    isMessageSendByCurrentUser,
  }
}
