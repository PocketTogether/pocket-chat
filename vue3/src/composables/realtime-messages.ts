import {
  pbMessagesRealtimeReConnectListApi,
  pbMessagesSubscribeAllApi,
  pbRealtimeSubscribePBCONNECT,
  type MessagesResponseWidthExpand,
} from '@/api'
import { appUserDefaultAvatar, routerDict } from '@/config'
import { pb } from '@/lib'
import { useI18nStore, useRealtimeMessagesStore } from '@/stores'
import { useWebNotification } from '@vueuse/core'
import { useRoute } from 'vue-router'

export const useRealtimeMessagesSubscribe = () => {
  const realtimeMessagesStore = useRealtimeMessagesStore()
  const route = useRoute()

  const i18nStore = useI18nStore()

  // 收到新消息时调用，根据情况决定是否通知
  const newMessageCheckAndNotif = (newMessage: MessagesResponseWidthExpand) => {
    // 消息为自己发送，不显示通知
    if (
      pb.authStore.record != null &&
      newMessage.author === pb.authStore.record.id
    ) {
      return
    }
    // 页面可见，并且当前为聊天页（pocket-together且消息房间为当前房间），不显示通知
    if (
      document.visibilityState === 'visible' &&
      route.name === routerDict.ChatHome.name
      // && newMessage.room
    ) {
      return
    }

    // 准备要显示的数据
    /** 标题-头像 */
    const title = (() => {
      // author == null是不正常的
      if (newMessage.expand?.author == null) {
        console.error('newMessage.expand.author == null')
        return ''
      }
      // 无名称，返回用户名
      if (newMessage.expand.author.name === '') {
        return newMessage.expand.author.username
      }
      // 正常，返回名称
      return newMessage.expand.author.name
    })()
    /** 内容 */
    const body = (() => {
      // 内容可能为图片
      if (newMessage.images.length > 0) {
        return i18nStore.t('chatMessageReplyMessageImageShowText')()
      }
      // 内容可能为文件
      if (newMessage.file !== '') {
        return i18nStore.t('chatMessageReplyMessageFileShowText')()
      }
      return newMessage.content
    })()
    /** 图标-头像 */
    const icon = (() => {
      // author == null是不正常的，返回默认头像
      if (newMessage.expand?.author == null) {
        console.error('newMessage.expand.author == null')
        return appUserDefaultAvatar
      }
      // 无头像，返回默认头像
      if (newMessage.expand.author.avatar === '') {
        return appUserDefaultAvatar
      }
      // 有头像，返回头像url
      return pb.files.getURL(
        newMessage.expand.author,
        newMessage.expand.author.avatar
      )
    })()

    // 准备通知
    const notif = useWebNotification({
      title,
      body,
      icon,
      tag: newMessage.id,
    })
    // 点击通知时回到页面
    notif.onClick(() => {
      window.focus()
    })
    // 显示通知
    notif.show().catch((error) => {
      console.warn('Failed to show notification:', error)
    })
  }

  // 启动订阅，将在App.vue调用
  const startSubscribe = async () => {
    // 防止多次调用
    if (realtimeMessagesStore.isSubscribeStarted) {
      return 'realtimeMessagesStore.isSubscribeStarted' as const
    }
    realtimeMessagesStore.isSubscribeStartedSetTrue()

    // pb实时连接订阅，PB_CONNECT，断线重连消息补偿
    await pbRealtimeSubscribePBCONNECT(async (e) => {
      // console.log('PB_CONNECT', e)

      // pb实时订阅连接时（断线重连时），请求最新的消息，不必用 useMutation（感觉在这里错误重试并不是很必要）
      const messageList = await pbMessagesRealtimeReConnectListApi().catch(
        (error) => {
          console.error('Failed to fetch messages on reconnect:', error)
          return null
        }
      )
      if (messageList == null) {
        return
      }

      // 判断是否为第一次连接
      // 是，为firstPbConnectMessage赋值
      if (realtimeMessagesStore.firstPbConnectMessage == null) {
        // 有消息，设置数据
        if (messageList.items.length > 0) {
          realtimeMessagesStore.firstPbConnectMessageSet(messageList.items[0])
        }
        // 无消息，设置 'none'
        else {
          realtimeMessagesStore.firstPbConnectMessageSet('none')
        }
      }
      // 否，尝试进行补偿
      else {
        // 最终补偿要达到的目的效果为，让 createList 的数据完整：
        // createList 的数据完整范围，firstPbConnectMessage 到 messageList 中最新的
        // 关键字段 MessagesResponseWidthExpand['created'] 例 "created": "2022-01-01 10:00:00.123Z"

        // 实现
        // 第一步：过滤出需要补偿的消息
        // 在 messageList 中过滤，得到比 firstPbConnectMessage.created 大的
        // （如果 firstPbConnectMessage 为 none 则直接返回 messageList）
        const msgItemsGtFirst = (() => {
          const firstPbConnectMessage =
            realtimeMessagesStore.firstPbConnectMessage
          if (firstPbConnectMessage === 'none') {
            return messageList.items
          }
          return messageList.items.filter(
            (i) => i.created > firstPbConnectMessage.created
          )
        })()
        // 第二步：过滤出 createList 中不存在的消息
        // 在 msgItemsGtFirst 过滤，得到 realtimeMessagesStore.createList 中没有的，也就是需要插入的
        // 用 Set 代替数组查找，可以把复杂度从 O(n²) 降到 O(n+m)，避免消息量大时卡顿。
        const existingIds = new Set(
          realtimeMessagesStore.createList.map((item) => item.id)
        )
        const msgItemsNeedInsert = msgItemsGtFirst.filter(
          (i) => !existingIds.has(i.id)
        )

        // 第三步：遍历并插入，并通知
        // 反转后遍历（原数组为created降序，升序遍历更合理），调用 realtimeMessagesStore.createListCheckAndInsert
        msgItemsNeedInsert.reverse().forEach((msg) => {
          const isAdded = realtimeMessagesStore.createListCheckAndInsert(msg)
          if (isAdded) {
            // 判断是否进行通知
            newMessageCheckAndNotif(msg)
          }
        })
      }
    }).catch((error) => {
      console.error('pbRealtimeSubscribePBCONNECT', error)
    })
    // pb实时消息订阅
    await pbMessagesSubscribeAllApi(async (e) => {
      // // 模拟延迟
      // await new Promise((resolve) => setTimeout(resolve, 6000))

      if (e.action === 'create') {
        const isAdded = realtimeMessagesStore.createListCheckAndPush(e.record)
        if (isAdded) {
          // 判断是否进行通知
          newMessageCheckAndNotif(e.record)
        }
      }
      if (e.action === 'update') {
        realtimeMessagesStore.updateListPush(e.record)
      }
      if (e.action === 'delete') {
        realtimeMessagesStore.deleteListPush(e.record)
      }
      // console.log(e)
    }).catch((error) => {
      console.error('pbMessagesSubscribeAllApi', error)
    })

    realtimeMessagesStore.isSubscribeReadySetTrue()
    return 'startSubscribe'
  }

  return {
    startSubscribe,
  }
}
