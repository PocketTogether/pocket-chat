<script setup lang="ts">
import { useRouteControlDialog } from '@/composables'
import { useI18nStore, useRealtimeMessagesStore } from '@/stores'
import { ContainerDialog } from '@/components'
import { useMutation } from '@tanstack/vue-query'
import { pb } from '@/lib'
import { pbMessagesDeleteChatApi } from '@/api'
import { potoMessage, watchUntilSourceCondition } from '@/utils'
import type { ChatInputBar } from './dependencies'
import { chatMessageControlRealtimeWaitTimeoutMsConfig } from '@/config'

const props = defineProps<{
  dialogMessageId: string | null
  messageInfoDialogClose: () => void
  /** 聊天输入栏，将使用其中的数据 */
  refChatInputBar: InstanceType<typeof ChatInputBar> | null
}>()

const i18nStore = useI18nStore()

const { dialogVisible, dialogOpen, dialogClose } = useRouteControlDialog({
  dialogQueryKey: 'MessageDeleteDialog',
})

// 消息删除Mutation
const messageDeleteMutation = useMutation({
  // mutation函数
  mutationFn: async () => {
    // 未登录，抛出错误
    if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
      throw new Error(
        '!pb.authStore.isValid || pb.authStore.record?.id == null'
      )
    }
    // 无 dialogMessageId，抛出错误
    if (props.dialogMessageId == null) {
      throw new Error('props.dialogMessageId == null')
    }

    // 通过 pocketbase SDK 请求
    const pbRes = await pbMessagesDeleteChatApi({
      messageId: props.dialogMessageId,
    })
    // console.log(pbRes)
    return pbRes
  },
  // 一些收尾工作
  onSuccess: (data) => {
    //
  },
  // 错误处理
  onError: (error) => {
    potoMessage({
      type: 'error',
      message: i18nStore.t('chatMessageDeleteErrorText')(),
    })
  },
  // 此接口非幂等，不重试
  // // ✅ 在网络错误时重试
  // retry: queryRetryPbNetworkError,
})

const realtimeMessagesStore = useRealtimeMessagesStore()

const messageDeleteSubmitRunning = ref(false)
const messageDeleteSubmit = async () => {
  if (messageDeleteSubmitRunning.value === true) {
    return
  }
  messageDeleteSubmitRunning.value = true
  try {
    const resData = await messageDeleteMutation.mutateAsync()

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
      props.refChatInputBar?.chatMessageIsRealtimeTimeoutSet(true)
    }

    // 关闭对话框
    dialogClose()
    props.messageInfoDialogClose()
    // 等待对话框关闭
    await new Promise((resolve) => setTimeout(resolve, 300))
  } finally {
    messageDeleteSubmitRunning.value = false
  }
}

defineExpose({
  dialogVisible,
  dialogOpen,
  dialogClose,
})
</script>

<template>
  <div>
    <ContainerDialog
      :dialogVisible="dialogVisible"
      :dialogCloseFn="dialogClose"
      :overlayBlur="false"
      :overlayTranslucent="false"
    >
      <div
        class="content-box flow-root rounded-[20px] bg-color-background-soft"
      >
        <div class="m-[20px]">
          <div class="mb-[10px]">
            <div class="text-center text-[14px] font-bold text-color-text-soft">
              <!-- 确认要删除此消息吗？ -->
              {{ i18nStore.t('chatMessageDeleteConfirmAskText')() }}
            </div>
          </div>
          <div class="flex justify-center">
            <!-- “确认”按钮 -->
            <ElButton
              type="danger"
              round
              :loading="messageDeleteSubmitRunning"
              size="small"
              @click="messageDeleteSubmit"
            >
              {{ i18nStore.t('settingButtonConfirm')() }}
            </ElButton>
            <!-- “取消”按钮 -->
            <ElButton type="info" round size="small" @click="dialogClose">
              {{ i18nStore.t('settingButtonCancel')() }}
            </ElButton>
          </div>
        </div>
      </div>
    </ContainerDialog>
  </div>
</template>

<style lang="scss" scoped>
.content-box {
  box-shadow: 0 0 6px 6px var(--color-background);
}
</style>
