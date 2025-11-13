<script setup lang="ts">
import { pbUsersRequestPasswordResetApi } from '@/api'
import { PotoFormValidationError } from '@/classes'
import { ConfirmContainer, ContainerDialog } from '@/components'
import { useRouteControlDialog } from '@/composables'
import { pbCollectionConfigDefaultGetFn } from '@/config'
import { Collections, onPbResErrorStatus401AuthClear, pb } from '@/lib'
import { queryRetryPbNetworkError, usePbCollectionConfigQuery } from '@/queries'
import { useI18nStore, useSettingStateStore } from '@/stores'
import {
  convertSecondsToTimeDuration,
  fetchWithTimeoutForPbRequestWillEmail,
  generateRandomClassName,
  parseISODate,
  potoMessage,
} from '@/utils'
import { useMutation } from '@tanstack/vue-query'
import { useNow, useWindowSize } from '@vueuse/core'
import type { ElForm, FormRules } from 'element-plus'
import type { GlobalComponents } from 'vue'

const { dialogVisible, dialogOpen, dialogClose } = useRouteControlDialog({
  dialogQueryKey: 'ForgotPasswordDialog',
})

defineExpose({
  dialogOpen,
  dialogClose,
})

const i18nStore = useI18nStore()

const formModel = ref({
  email: '',
})
const form = ref<InstanceType<typeof ElForm> | null>(null)

const rules: FormRules<typeof formModel> = {
  email: [
    {
      required: true,
      message: i18nStore.t('loginForgotPasswordRulesEmailRequiredMessage')(),
      trigger: 'blur',
    },
    {
      type: 'email',
      message: i18nStore.t('loginForgotPasswordRulesEmailTypeMessage')(),
      trigger: 'blur',
    },
  ],
}

// 遮罩确认框
const refConfirmContainer = ref<InstanceType<typeof ConfirmContainer> | null>(
  null
)

// 修改密码mutations
const mutation = useMutation({
  // mutation函数
  mutationFn: async () => {
    // 通过 pocketbase SDK 请求
    const pbRes = await pbUsersRequestPasswordResetApi(formModel.value.email)
    // console.log(pbRes)
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

const cancelFn = () => {
  form.value?.resetFields()
  dialogClose()
}

const submitRunning = ref(false)
// 重置密码
const submit = async () => {
  submitRunning.value = true
  try {
    // 表单校验
    await form.value?.validate().catch(() => {
      throw new PotoFormValidationError()
    })

    // 遮罩确认框
    await refConfirmContainer.value?.confirm()

    // 修改邮箱请求mutation.mutateAsync
    await mutation.mutateAsync().catch(() => {})
    // catch错误，意在不成功也要设置速率限制

    // 设置速率限制
    settingStateStore.passwordUpdateRateLimitSet({
      passwordUpdatePendingVerificationEmail: formModel.value.email,
    })

    // } catch (error) {
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
  <div class="forgot-password-dialog">
    <ContainerDialog
      :dialogVisible="dialogVisible"
      :dialogCloseFn="dialogClose"
    >
      <div class="flow-root rounded-3xl bg-color-background-soft">
        <div class="m-4">
          <div>
            <ConfirmContainer
              ref="refConfirmContainer"
              backgroundColorTwcss="bg-color-background-soft"
              :title="
                i18nStore.t('loginForgotPasswordConfirmContainerTitle')(
                  formModel.email
                )
              "
              size="small"
            >
              <!-- 内容标题 -->
              <div class="mb-3 ml-3 text-sm font-bold text-color-text-soft">
                <!-- 忘记密码 -->
                {{ i18nStore.t('loginForgotPasswordContentTitle')() }}
              </div>
              <!-- 表单盒子 -->
              <div class="mx-auto max-w-[500px]">
                <ElForm
                  ref="form"
                  :model="formModel"
                  :rules="rules"
                  size="large"
                  class="poto-el-form-line"
                >
                  <ElFormItem prop="email">
                    <!-- 输入框标题 -->
                    <div class="mb-[2px] ml-[25px] text-[12px] leading-[12px]">
                      <!-- 邮箱 -->
                      {{ i18nStore.t('loginForgotPasswordEmailLable')() }}
                    </div>
                    <!-- 待验证时，显示禁用的ElInput -->
                    <ElInput
                      v-if="passwordUpdateRateLimitInfo != null"
                      :modelValue="
                        passwordUpdateRateLimitInfo.passwordUpdatePendingVerificationEmail
                      "
                      class="poto-el-input-line"
                      disabled
                    >
                      <template #prefix>
                        <RiMailLine size="16px"></RiMailLine>
                      </template>
                    </ElInput>
                    <!-- 正常的ElInput -->
                    <ElInput
                      v-else
                      v-model="formModel.email"
                      class="poto-el-input-line"
                      :disabled="submitRunning"
                      :placeholder="
                        // 请输入邮箱
                        i18nStore.t('loginForgotPasswordPlaceholderEmail')()
                      "
                    >
                      <template #prefix>
                        <RiMailLine size="16px"></RiMailLine>
                      </template>
                    </ElInput>
                  </ElFormItem>
                </ElForm>
              </div>
              <!-- 按钮盒子 -->
              <div class="poto-setting-button-box not-center">
                <ElButton round @click="cancelFn()">
                  {{ i18nStore.t('settingButtonCancel')() }}
                </ElButton>
                <!-- 重置密码按钮 -->
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
                      i18nStore.t('loginForgotPasswordRetryAfterDuration')(
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
                  <!-- 重置密码 -->
                  <template v-else>
                    {{ i18nStore.t('loginForgotPasswordButtonSubmitText')() }}
                  </template>
                </ElButton>
              </div>
            </ConfirmContainer>
          </div>
        </div>
      </div>
    </ContainerDialog>
  </div>
</template>

<style lang="scss" scoped></style>
