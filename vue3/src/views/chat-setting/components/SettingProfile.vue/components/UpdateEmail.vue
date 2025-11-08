<script setup lang="ts">
import { PotoFormValidationError } from '@/classes'
// import type ConfirmContainer from '@/components/tool/ConfirmContainer.vue'
// 改为使用 GlobalComponents ，即 components.d.ts 中的内容
import type { GlobalComponents } from 'vue'
import { pbCollectionConfigDefaultGetFn } from '@/config'
import { Collections, onPbResErrorStatus401AuthClear, pb } from '@/lib'
import {
  queryRetryPbNetworkError,
  usePbCollectionConfigQuery,
  useProfileQuery,
} from '@/queries'
import { useI18nStore, useSettingStateStore } from '@/stores'
import {
  convertSecondsToTimeDuration,
  fetchWithTimeoutForPbRequestWillEmail,
  fetchWithTimeoutPreferred,
  parseISODate,
  potoMessage,
} from '@/utils'
import { useMutation } from '@tanstack/vue-query'
import { useNow } from '@vueuse/core'
import type { ElForm, FormRules } from 'element-plus'
import { ClientResponseError } from 'pocketbase'
import { pbUsersRequestEmailChangeApi } from '@/api'
import { ConfirmContainer } from '@/components'

const i18nStore = useI18nStore()

// 个人信息查询
const profileQuery = useProfileQuery()

const formModel = ref({
  email: '',
})
const form = ref<InstanceType<typeof ElForm> | null>(null)
// 当前表单是否已编辑，已编辑则不再跟随profileQuery.data变化
const isEdited = ref(false)
const setEdited = (val: boolean) => {
  isEdited.value = val
}

/**
 * 表示当前表单中的 email 字段是否与远程用户资料中的 email 相同。
 * 当两者一致时，说明未被修改，用于禁用“保存”按钮
 */
const isDataUnchanged = computed(() => {
  // 暂未得到profileQuery响应时，保持禁用比较好
  if (profileQuery.data.value == null) {
    return true
  }

  if (profileQuery.data.value.email !== formModel.value.email) {
    return false
  }
  return true
})

// 初始化表单数据
const initData = () => {
  if (profileQuery.data.value == null) {
    return
  }
  formModel.value.email = profileQuery.data.value.email
}

// 取消按钮函数
const cancelFn = () => {
  setEdited(false)
  initData()
  // 触发校验以将可能的错误信息消除
  form.value?.validate()
}

// 监听profileQuery.data，改变时赋值给当前表单数据。组件setup时也会立即执行
watch(
  profileQuery.data,
  () => {
    if (isEdited.value) {
      return
    }
    initData()
  },
  { deep: true, immediate: true }
)

// 记录错误的表单项，以便在规则中判断并使用
// 在提交时，如果出现错误，就会判断错误信息并向对应List添加错误的值
// 已存在的邮箱
const errorEmailList_validation_not_unique = ref<string[]>([])

const rules: FormRules<typeof formModel> = {
  email: [
    {
      required: true,
      message: i18nStore.t('registerRulesEmailRequiredMessage')(),
      trigger: 'blur',
    },
    {
      type: 'email',
      message: i18nStore.t('registerRulesEmailTypeMessage')(),
      trigger: 'blur',
    },
    {
      // 已存在的邮箱记录数组中如果有当前值，则表示此邮箱已存在
      validator: (rule, value, callback) => {
        if (
          errorEmailList_validation_not_unique.value.includes(
            formModel.value.email
          )
        ) {
          callback(
            new Error(i18nStore.t('registerRulesEmailValidatorNotUnique')())
          )
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 遮罩确认框
const refConfirmContainer = ref<InstanceType<typeof ConfirmContainer> | null>(
  null
)

// 修改邮箱请求mutation
const mutation = useMutation({
  // mutation函数
  mutationFn: async () => {
    // 未登录，抛出错误
    if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
      throw new Error(
        '!pb.authStore.isValid || pb.authStore.record?.id == null'
      )
    }

    // 通过 pocketbase SDK 请求
    const pbRes = await pbUsersRequestEmailChangeApi(formModel.value.email)
    console.log(pbRes)
    return pbRes
  },
  // ✅ 在网络错误时重试
  retry: queryRetryPbNetworkError,
  // 错误处理
  onError: (error) => {
    if (error instanceof ClientResponseError) {
      // pb相关错误
      if (error.data?.data?.newEmail?.code === 'validation_invalid_new_email') {
        // 邮箱已存在
        errorEmailList_validation_not_unique.value.push(formModel.value.email)
      }
      // 触发校验以显示错误
      form.value?.validate()
    } else if (error instanceof PotoFormValidationError) {
      // 这是表单校验抛出的错误，什么都不用做
    } else {
      // 未知错误
      potoMessage({
        type: 'error',
        message: i18nStore.t('messageUpdateFailure')(),
      })
    }
  },
  // 一些收尾工作
  onSuccess: (data) => {},
})

const submitRunning = ref(false)
// 修改邮箱
const submit = async () => {
  submitRunning.value = true
  try {
    // 表单校验
    await form.value?.validate().catch(() => {
      throw new PotoFormValidationError()
    })

    // 进行实质操作前，先重新请求个人信息（避免邮件已修改）
    await profileQuery.refetch()
    // 遮罩确认框
    await refConfirmContainer.value?.confirm()

    // 修改邮箱请求mutation.mutateAsync
    await mutation.mutateAsync().catch(() => {})
    // catch错误，意在不成功也要设置速率限制

    // 设置速率限制
    settingStateStore.emailUpdateRateLimitSet({
      emailUpdatePendingVerificationEmail: formModel.value.email,
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
// 邮箱提交最短秒数（速率限制时间，单位秒，由pocketbase的config集合控制）
const emailUpdateRateLimitSec = computed(
  () =>
    pbCollectionConfigQuery.data.value?.['email-update-rate-limit-second'] ??
    pbCollectionConfigDefaultGetFn()['email-update-rate-limit-second']
)
// 距离下次可以提交的时间 单位秒
const secondsUntilNextEmailSubmit = computed(() => {
  const lastSubmitDateObj = parseISODate(
    settingStateStore.emailUpdateLastSubmitDate
  )
  if (lastSubmitDateObj == null) return 0

  const diffMs =
    lastSubmitDateObj.getTime() +
    emailUpdateRateLimitSec.value * 1000 -
    nowRef.value.getTime()
  return Math.max(Math.ceil(diffMs / 1000), 0)
})
// 最终的信息汇总，将使用此对象渲染
const emailUpdateRateLimitInfo = computed(() => {
  if (secondsUntilNextEmailSubmit.value > 0) {
    return {
      secondsUntilNextEmailSubmit: secondsUntilNextEmailSubmit.value,
      emailUpdatePendingVerificationEmail:
        settingStateStore.emailUpdatePendingVerificationEmail,
      // 是否已修改（已验证），即是否和当前profile email相等
      isEmailUpdateVerified:
        settingStateStore.emailUpdatePendingVerificationEmail ===
        profileQuery.data.value?.email,
    }
  } else {
    return null
  }
})
</script>

<template>
  <!-- 修改邮箱组件 -->
  <div>
    <ConfirmContainer
      ref="refConfirmContainer"
      backgroundColorTwcss="bg-color-background-soft"
      :title="
        i18nStore.t('settingProfileUpdateEmailConfirmContainerTitle')(
          formModel.email
        )
      "
      size="small"
    >
      <!-- 内容标题 -->
      <div class="mb-3 ml-3 text-sm font-bold text-color-text-soft">
        {{ i18nStore.t('settingProfileUpdateEmailContentTitle')() }}
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
              {{ i18nStore.t('settingProfileUpdateEmailEmailLable')() }}
            </div>
            <!-- 待验证时，显示禁用的ElInput -->
            <ElInput
              v-if="emailUpdateRateLimitInfo != null"
              :modelValue="
                emailUpdateRateLimitInfo.emailUpdatePendingVerificationEmail
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
            >
              <template #prefix>
                <RiMailLine size="16px"></RiMailLine>
              </template>
            </ElInput>
          </ElFormItem>
        </ElForm>
      </div>
      <!-- 按钮盒子 -->
      <div class="poto-setting-button-box">
        <!-- 保存按钮 -->
        <ElButton
          :loading="submitRunning"
          :disabled="isDataUnchanged || emailUpdateRateLimitInfo != null"
          type="primary"
          round
          @click="submit()"
        >
          <!-- 显示：已验证 or 待验证 -->
          <template v-if="emailUpdateRateLimitInfo != null">
            <!-- 已验证 -->
            <template
              v-if="emailUpdateRateLimitInfo.isEmailUpdateVerified === true"
            >
              {{ i18nStore.t('settingProfileUpdateEmailVerifiedText')() }}
            </template>
            <!-- 待验证 -->
            <template v-else>
              {{
                i18nStore.t(
                  'settingProfileUpdateEmailPendingVerificationText'
                )()
              }}
            </template>
          </template>
          <!-- 显示：保存 -->
          <template v-else>
            {{ i18nStore.t('settingButtonSave')() }}
          </template>
        </ElButton>
        <!-- 取消按钮 -->
        <ElButton
          type="info"
          round
          :disabled="submitRunning || emailUpdateRateLimitInfo != null"
          @click="cancelFn()"
        >
          <!-- 显示：xx 秒后可重试 -->
          <template v-if="emailUpdateRateLimitInfo != null">
            {{
              i18nStore.t('settingProfileUpdateEmailRetryAfterDuration')(
                convertSecondsToTimeDuration({
                  seconds: emailUpdateRateLimitInfo.secondsUntilNextEmailSubmit,
                  unitLength: 1,
                  messages: i18nStore.t(
                    'convertSecondsToTimeDurationMessages'
                  )(),
                })
              )
            }}
          </template>
          <!-- 显示：取消 -->
          <template v-else>
            {{ i18nStore.t('settingButtonCancel')() }}
          </template>
        </ElButton>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped></style>
