<script setup lang="ts">
import type { GlobalComponents } from 'vue'
import {
  queryRetryPbNetworkError,
  usePbCollectionConfigQuery,
  useProfileQuery,
} from '@/queries'
import { useI18nStore, useSettingStateStore } from '@/stores'
import { useMutation } from '@tanstack/vue-query'
import { Collections, onPbResErrorStatus401AuthClear, pb } from '@/lib'
import {
  convertSecondsToTimeDuration,
  fetchWithTimeoutForPbRequestWillEmail,
  parseISODate,
  potoMessage,
} from '@/utils'
import { useNow } from '@vueuse/core'
import { pbCollectionConfigDefaultGetFn } from '@/config'
import { pbUsersRequestPasswordResetApi } from '@/api'
import { ConfirmContainer } from '@/components'

const i18nStore = useI18nStore()

// 个人信息查询
const profileQuery = useProfileQuery()

// 遮罩确认框
const refConfirmContainer = ref<InstanceType<typeof ConfirmContainer> | null>(
  null
)

// 修改密码mutation
const mutation = useMutation({
  // mutation函数
  mutationFn: async () => {
    // 未登录，抛出错误
    if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
      throw new Error(
        '!pb.authStore.isValid || pb.authStore.record?.id == null'
      )
    }
    // 个人信息没有值，抛出错误
    if (profileQuery.data.value == null) {
      throw new Error('!profileQuery.data.value == null')
    }

    // 通过 pocketbase SDK 请求
    const pbRes = await pbUsersRequestPasswordResetApi(
      profileQuery.data.value.email
    )

    console.log(pbRes)
    return pbRes
  },
  // ✅ 在网络错误时重试
  retry: queryRetryPbNetworkError,
  onError: (error) => {
    // 未知错误
    potoMessage({
      type: 'error',
      message: i18nStore.t('messageUpdateFailure')(),
    })
  },
  // 一些收尾工作
  onSuccess: (data) => {},
})

const submitRunning = ref(false)
// 修改密码
const submit = async () => {
  submitRunning.value = true
  try {
    // 进行实质操作前，先重新请求个人信息（避免邮件已修改）
    await profileQuery.refetch()
    // 遮罩确认框
    await refConfirmContainer.value?.confirm()
    // 修改密码请求mutation.mutateAsync
    await mutation.mutateAsync().catch(() => {})
    // catch错误，意在不成功也要设置速率限制

    // 设置速率限制
    settingStateStore.passwordUpdateRateLimitSet({
      passwordUpdatePendingVerificationEmail:
        profileQuery.data.value?.email ?? '',
    })
  } finally {
    submitRunning.value = false
  }
}

/* 速率限制 */
const pbCollectionConfigQuery = usePbCollectionConfigQuery()
const settingStateStore = useSettingStateStore()
// 响应式的当前时间，每秒更新一次
const nowRef = useNow({ interval: 1000 })
// 密码修改提交最短秒数（速率限制时间，单位秒，由pocketbase的config集合控制）
const passwordUpdateRateLimitSec = computed(
  () =>
    pbCollectionConfigQuery.data.value?.['password-update-rate-limit-second'] ??
    pbCollectionConfigDefaultGetFn()['password-update-rate-limit-second']
)
// 距离下次可以提交的时间 单位秒
const secondsUntilNextEmailSubmit = computed(() => {
  const lastSubmitDateObj = parseISODate(
    settingStateStore.passwordUpdateLastSubmitDate
  )
  if (lastSubmitDateObj == null) return 0

  const diffMs =
    lastSubmitDateObj.getTime() +
    passwordUpdateRateLimitSec.value * 1000 -
    nowRef.value.getTime()
  return Math.max(Math.ceil(diffMs / 1000), 0)
})
// 最终的信息汇总，将使用此对象渲染
const passwordUpdateRateLimitInfo = computed(() => {
  if (secondsUntilNextEmailSubmit.value > 0) {
    return {
      secondsUntilNextEmailSubmit: secondsUntilNextEmailSubmit.value,
      passwordUpdatePendingVerificationEmail:
        settingStateStore.passwordUpdatePendingVerificationEmail,
    }
  } else {
    return null
  }
})
</script>

<template>
  <!-- 修改密码 -->
  <div>
    <ConfirmContainer
      ref="refConfirmContainer"
      size="small"
      backgroundColorTwcss="bg-color-background-soft"
      :title="
        i18nStore.t('settingProfileUpdatePasswordConfirmContainerTitle')(
          profileQuery.data.value?.email ?? ''
        )
      "
    >
      <!-- 标题 -->
      <div class="mb-3 ml-3 text-sm font-bold text-color-text-soft">
        <!-- 修改密码 -->
        {{ i18nStore.t('settingProfileUpdatePasswordContentTitle')() }}
      </div>
      <!-- 按钮 -->
      <div class="poto-setting-button-box not-center">
        <ElButton
          :loading="submitRunning"
          :disabled="passwordUpdateRateLimitInfo != null"
          type="primary"
          round
          @click="submit()"
        >
          <template v-if="passwordUpdateRateLimitInfo != null">
            <!-- 显示：xx 秒后可重试 -->
            {{
              i18nStore.t('settingProfileUpdatePasswordRetryAfterDuration')(
                convertSecondsToTimeDuration({
                  seconds:
                    passwordUpdateRateLimitInfo.secondsUntilNextEmailSubmit,
                  unitLength: 1,
                  messages: i18nStore.t(
                    'convertSecondsToTimeDurationMessages'
                  )(),
                })
              )
            }}
          </template>
          <!-- 修改点击前 -->
          <template v-else>
            {{ i18nStore.t('settingProfileUpdatePasswordButtonSubmitText')() }}
          </template>
        </ElButton>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped></style>
