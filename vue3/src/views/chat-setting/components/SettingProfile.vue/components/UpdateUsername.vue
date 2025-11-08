<script setup lang="ts">
import { pbUsersUpdateUsernameApi } from '@/api'
import { PotoFormValidationError } from '@/classes'
import { rulesUsername } from '@/config'
import {
  Collections,
  onPbResErrorStatus401AuthClear,
  pb,
  type Update,
} from '@/lib'
import { queryKeys, queryRetryPbNetworkError, useProfileQuery } from '@/queries'
import { useI18nStore } from '@/stores'
import {
  compareDatesSafe,
  fetchWithTimeoutPreferred,
  potoMessage,
} from '@/utils'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { ElForm, FormRules } from 'element-plus'
import { ClientResponseError } from 'pocketbase'

const i18nStore = useI18nStore()

// 个人信息查询
const profileQuery = useProfileQuery()

const formModel = ref({
  username: '',
})
const form = ref<InstanceType<typeof ElForm> | null>(null)

// 当前表单是否已编辑，已编辑则不再跟随profileQuery.data变化
const isEdited = ref(false)
const setEdited = (val: boolean) => {
  isEdited.value = val
}

/**
 * 表示当前表单中的字段是否与远程用户资料中的相同。
 * 当两者一致时，说明未被修改，用于禁用“保存”按钮
 */
const isDataUnchanged = computed(() => {
  // 暂未得到profileQuery响应时，保持禁用比较好
  if (profileQuery.data.value == null) {
    return true
  }

  if (profileQuery.data.value.username !== formModel.value.username) {
    return false
  }
  return true
})

// 初始化表单数据
const initData = () => {
  if (profileQuery.data.value == null) {
    return
  }
  formModel.value.username = profileQuery.data.value.username
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
// 已存在的用户名
const errorUsernameList_validation_not_unique = ref<string[]>([])

const rules: FormRules<typeof formModel> = {
  username: [
    {
      required: true,
      message: i18nStore.t('registerRulesUsernameRequiredMessage')(),
      trigger: 'blur',
    },
    {
      // 字符规则 Char
      pattern: rulesUsername.patternChar,
      message: i18nStore.t('registerRulesUsernamePatternCharMessage')(),
      trigger: 'blur',
    },
    {
      // 长度规则 Length
      pattern: rulesUsername.patternLength,
      message: i18nStore.t('registerRulesUsernamePatternLengthMessage')(),
      trigger: 'blur',
    },
    {
      // 已存在的用户名记录数组中如果有当前值，则表示此用户名已存在
      validator: (rule, value, callback) => {
        if (
          errorUsernameList_validation_not_unique.value.includes(
            formModel.value.username
          )
        ) {
          callback(
            new Error(i18nStore.t('registerRulesUsernameValidatorNotUnique')())
          )
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const queryClient = useQueryClient()

const mutation = useMutation({
  // 请求逻辑
  mutationFn: async () => {
    // 未登录，抛出错误
    if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
      throw new Error(
        '!pb.authStore.isValid || pb.authStore.record?.id == null'
      )
    }

    // 表单校验
    await form.value?.validate().catch(() => {
      throw new PotoFormValidationError()
    })

    // 通过 pocketbase SDK 请求
    const pbRes = await pbUsersUpdateUsernameApi({
      username: formModel.value.username,
    })
    console.log(pbRes)
    return pbRes
  },
  // 一些收尾工作
  onSuccess: (data) => {
    // 更新query缓存
    // 更新前，应确认data.update时间为最新的，以此方式避免两次很近的请求导致问题
    if (
      profileQuery.data.value != null &&
      // data.updated > profileQuery.data.value.updated
      compareDatesSafe(data.updated, profileQuery.data.value.updated) === 1
    ) {
      // 更新query缓存
      queryClient.setQueryData(
        queryKeys.profile(pb.authStore.record?.id ?? ''),
        // 确保类型正确
        data satisfies NonNullable<typeof profileQuery.data.value>
      )
    }
    // 取消已编辑标记，重新初始化数据
    setEdited(false)
    initData()
    potoMessage({
      type: 'success',
      message: i18nStore.t('messageUpdateSuccess')(),
    })
  },
  // 错误处理
  onError: (error) => {
    if (error instanceof ClientResponseError) {
      // pb相关错误
      if (error.data?.data?.username?.code === 'validation_not_unique') {
        // 用户名已存在
        errorUsernameList_validation_not_unique.value.push(
          formModel.value.username
        )
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
  // ✅ 在网络错误时重试
  retry: queryRetryPbNetworkError,
})
const isSubmitting = mutation.isPending
const submit = mutation.mutateAsync
</script>

<template>
  <!-- 修改用户名组件 -->
  <div>
    <!-- 内容标题 -->
    <div class="mb-3 ml-3 text-sm font-bold text-color-text-soft">
      {{ i18nStore.t('settingProfileUpdateUsernameContentTitle')() }}
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
        <ElFormItem prop="username">
          <!-- 输入框标题 -->
          <div class="mb-[2px] ml-[25px] text-[12px] leading-[12px]">
            {{ i18nStore.t('settingProfileUpdateUsernameUsernameLable')() }}
          </div>
          <ElInput v-model="formModel.username" class="poto-el-input-line">
            <template #prefix>
              <RiUser4Line size="16px"></RiUser4Line>
            </template>
          </ElInput>
        </ElFormItem>
      </ElForm>
    </div>
    <!-- 按钮盒子 -->
    <div class="poto-setting-button-box">
      <ElButton
        :loading="isSubmitting"
        type="primary"
        round
        :disabled="isDataUnchanged"
        @click="submit()"
      >
        {{ i18nStore.t('settingButtonSave')() }}
      </ElButton>
      <ElButton type="info" round @click="cancelFn()">
        {{ i18nStore.t('settingButtonCancel')() }}
      </ElButton>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
