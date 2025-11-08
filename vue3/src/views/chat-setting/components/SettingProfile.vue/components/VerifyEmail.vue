<script setup lang="ts">
// import type ConfirmContainer from '@/components/tool/ConfirmContainer.vue'
// 改为使用 GlobalComponents ，即 components.d.ts 中的内容
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
import { pbUsersRequestVerificationApi } from '@/api'
import { ConfirmContainer } from '@/components'

const i18nStore = useI18nStore()

// 个人信息查询
const profileQuery = useProfileQuery()

// 遮罩确认框
const refConfirmContainer = ref<InstanceType<typeof ConfirmContainer> | null>(
  null
)

// 验证邮箱请求mutation
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
    const pbRes = await pbUsersRequestVerificationApi(
      profileQuery.data.value.email
    )

    console.log(pbRes)
    return pbRes
  },
  // ✅ 在网络错误时重试
  retry: queryRetryPbNetworkError,
  // 错误处理
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
// 验证邮箱
const submit = async () => {
  submitRunning.value = true
  try {
    // 进行实质操作前，先重新请求个人信息（避免邮件已修改）
    await profileQuery.refetch()
    // 遮罩确认框
    await refConfirmContainer.value?.confirm()

    // 修改邮箱请求mutation.mutateAsync
    await mutation.mutateAsync().catch(() => {})
    // catch错误，意在不成功也要设置速率限制

    // 设置速率限制
    settingStateStore.emailVerifyRateLimitSet({
      emailVerifyPendingVerificationEmail: profileQuery.data.value?.email ?? '',
    })

    // } catch (error) {
  } finally {
    submitRunning.value = false
  }
}

// 是否已验证，即是否profile verified
const isEmailVerified = computed(() => {
  if (profileQuery.data.value != null) {
    return profileQuery.data.value.verified
  }
  // 无profileQuery时暂为未验证
  return false
})

/* 速率限制 */
const pbCollectionConfigQuery = usePbCollectionConfigQuery()
const settingStateStore = useSettingStateStore()
// 响应式的当前时间，每秒更新一次
const nowRef = useNow({ interval: 1000 })
// 邮箱提交最短秒数（速率限制时间，单位秒，由pocketbase的config集合控制）
const emailVerifyRateLimitSec = computed(
  () =>
    pbCollectionConfigQuery.data.value?.['email-verify-rate-limit-second'] ??
    pbCollectionConfigDefaultGetFn()['email-verify-rate-limit-second']
)
// 距离下次可以提交的时间 单位秒
const secondsUntilNextEmailSubmit = computed(() => {
  const lastSubmitDateObj = parseISODate(
    settingStateStore.emailVerifyLastSubmitDate
  )
  if (lastSubmitDateObj == null) return 0

  const diffMs =
    lastSubmitDateObj.getTime() +
    emailVerifyRateLimitSec.value * 1000 -
    nowRef.value.getTime()
  return Math.max(Math.ceil(diffMs / 1000), 0)
})
// 最终的信息汇总，将使用此对象渲染
const emailVerifyRateLimitInfo = computed(() => {
  if (secondsUntilNextEmailSubmit.value > 0) {
    return {
      secondsUntilNextEmailSubmit: secondsUntilNextEmailSubmit.value,
      emailVerifyPendingVerificationEmail:
        settingStateStore.emailVerifyPendingVerificationEmail,
    }
  } else {
    return null
  }
})
</script>

<template>
  <!-- 验证邮箱组件 -->
  <div>
    <!-- 遮罩确认框 -->
    <ConfirmContainer
      ref="refConfirmContainer"
      backgroundColorTwcss="bg-color-background-soft"
      :title="
        // 遮罩确认框内容
        i18nStore.t('settingProfileVerifyEmailConfirmContainerTitle')(
          profileQuery.data.value?.email ?? ''
        )
      "
      size="small"
    >
      <!-- 内容标题 -->
      <div class="mb-3 ml-3 text-sm font-bold text-color-text-soft">
        <!-- 验证邮箱 -->
        {{ i18nStore.t('settingProfileVerifyEmailContentTitle')() }}
        |
        <template v-if="isEmailVerified === true">
          <!-- 已验证 -->
          {{ i18nStore.t('settingProfileVerifyEmailVerifiedText')() }}
        </template>
        <template v-else>
          <!-- 未验证 -->
          {{ i18nStore.t('settingProfileVerifyEmailUnverifiedText')() }}
        </template>
      </div>
      <!-- 按钮盒子 -->
      <div class="poto-setting-button-box not-center">
        <ElButton
          :loading="submitRunning"
          :disabled="
            emailVerifyRateLimitInfo != null || isEmailVerified === true
          "
          type="primary"
          round
          @click="submit()"
        >
          <!-- 已验证 -->
          <template v-if="isEmailVerified">
            {{ i18nStore.t('settingProfileVerifyEmailVerifiedText')() }}
          </template>
          <!-- 待验证 -->
          <template v-else-if="emailVerifyRateLimitInfo != null">
            <!-- 显示：xx 秒后可重试 -->
            {{
              i18nStore.t('settingProfileVerifyEmailRetryAfterDuration')(
                convertSecondsToTimeDuration({
                  seconds: emailVerifyRateLimitInfo.secondsUntilNextEmailSubmit,
                  unitLength: 1,
                  messages: i18nStore.t(
                    'convertSecondsToTimeDurationMessages'
                  )(),
                })
              )
            }}
          </template>
          <!-- 未验证（验证邮箱） -->
          <template v-else>
            {{ i18nStore.t('settingProfileVerifyEmailButtonSubmitText')() }}
          </template>
        </ElButton>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped></style>
