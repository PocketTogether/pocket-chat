import { ref } from 'vue'
import type {
  FilesResponseWithBaseExpand,
  ImagesResponseWithBaseExpand,
  MessagesResponseWidthExpand,
  MessagesResponseWidthExpandReplyMessage,
  PMLRCApiParameters0DataPageParamNonNullable,
} from '@/api'
import type { ChatRoomMessagesLimitCursorValType } from '@/components'

/** ChatCol 所需要的页面恢复数据，也就是决定页面显示内容的所有数据 */
export type PageRecoverDataForChatColItemType = {
  uuid: string
  data: {
    chatRoomId: string
    twowayPositioningCursorData: PMLRCApiParameters0DataPageParamNonNullable | null
    linkPositioningFlagMessageId: string | null
    linkPositioningFlagShow: boolean
    replyPositioningFlagMessageId: string | null
    replyPositioningFlagShow: boolean
    chatRoomMessagesLimitTopCursor: ChatRoomMessagesLimitCursorValType
    chatRoomMessagesLimitBottomCursor: ChatRoomMessagesLimitCursorValType
    chatInputContent: string
    chatImageSelectList: ImagesResponseWithBaseExpand[]
    chatFileSelectList: FilesResponseWithBaseExpand[]
    chatReplyMessage: MessagesResponseWidthExpandReplyMessage | null
    chatEditMessage: MessagesResponseWidthExpand | null
    chatMessageIsRealtimeTimeout: boolean
    dialogMessageId: string | null
    refScrollWarpScrollTop: number
    chatRoomMessagesRealtimeReadNumber: number
    imageScreenViewerImageList: ImagesResponseWithBaseExpand[]
    imageScreenViewerImageCurrentId: string
  }
}

/** 封装 ChatCol 相关恢复数据逻辑 pageRecoverDataForChatCol */
export const useRecoverChatColModule = (data: {
  //
  currentUuid: Ref<string | null>
}) => {
  const {
    //
    currentUuid,
  } = data

  // 【页面恢复数据】各路由页面恢复数据，主要用于路由返回时，页面中的数据恢复（返回时保持之前浏览的位置和数据）

  // 【页面恢复数据 ChatCol 】用于 ChatCol 的页面恢复数据
  const pageRecoverDataForChatCol = ref<
    Array<PageRecoverDataForChatColItemType>
  >([])
  // ChatCol 的页面恢复数据设置方法
  const pageRecoverDataForChatColItemSetFn = (
    val: PageRecoverDataForChatColItemType
  ) => {
    // 按uuid查找，找到则更新，找不到则添加
    const find = pageRecoverDataForChatCol.value.find(
      (i) => i.uuid === val.uuid
    )
    if (find != null) {
      find.data = val.data
      return 'update' as const
    } else {
      pageRecoverDataForChatCol.value.push(val)
      return 'push' as const
    }
  }
  // ChatCol 的页面恢复数据获取方法
  const pageRecoverDataForChatColItemGetFn = (uuid: string) => {
    const find = pageRecoverDataForChatCol.value.find((i) => i.uuid === uuid)
    return find
  }
  // 设置当前的 ChatCol 的页面恢复数据
  const currentSetPageRecoverDataForChatColItem = (
    data: PageRecoverDataForChatColItemType['data']
  ) => {
    if (currentUuid.value == null) {
      return null
    }
    return pageRecoverDataForChatColItemSetFn({
      uuid: currentUuid.value,
      data,
    })
  }
  // 获取当前的 ChatCol 的页面恢复数据
  const currentGetPageRecoverDataForChatColItem = () => {
    if (currentUuid.value == null) {
      return null
    }
    return pageRecoverDataForChatColItemGetFn(currentUuid.value)
  }

  return {
    //
    pageRecoverDataForChatCol,
    pageRecoverDataForChatColItemSetFn,
    pageRecoverDataForChatColItemGetFn,
    currentGetPageRecoverDataForChatColItem,
    currentSetPageRecoverDataForChatColItem,
  }
}
