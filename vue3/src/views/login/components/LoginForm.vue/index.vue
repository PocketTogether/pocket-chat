<script setup lang="ts">
import { useI18nStore } from '@/stores'
import type { ElForm } from 'element-plus'
import { useLoginFormRules, useLoginFormSubmit } from './composables'
import ForgotPasswordDialog from './components/ForgotPasswordDialog.vue'
import { routerDict } from '@/config'
import { usePbCollectionConfigQuery } from '@/queries'

const i18nStore = useI18nStore()

const formModel = ref({
  usernameOrEmail: '',
  password: '',
})
export type LoginFormFormModel = typeof formModel
const form = ref<InstanceType<typeof ElForm> | null>(null)
export type LoginFormForm = typeof form

// 封装了表单规则相关
const { rules, isPrepareToSubmit } = useLoginFormRules({
  formModel,
})

// 封装了提交函数相关
const { isSubmitting, submit } = useLoginFormSubmit({
  form,
  formModel,
  isPrepareToSubmit,
})

const refForgotPasswordDialog = ref<InstanceType<
  typeof ForgotPasswordDialog
> | null>(null)

const clickForgotPassword = () => {
  // 打开忘记密码对话框
  refForgotPasswordDialog.value?.dialogOpen()
}

const pbCollectionConfigQuery = usePbCollectionConfigQuery()

// 是否允许所有人查看，否则不显示游客模式
const allowAnonymousView = computed(() => {
  const val = pbCollectionConfigQuery.data.value?.['allow-anonymous-view']
  // val == null 只为了类型确定，理论上此值不会为空，默认为true
  if (val == null) {
    return true
  }
  return val
})
</script>

<template>
  <ForgotPasswordDialog ref="refForgotPasswordDialog"></ForgotPasswordDialog>
  <ElForm
    ref="form"
    :model="formModel"
    :rules="rules"
    size="large"
    class="poto-el-form-line"
  >
    <ElFormItem prop="usernameOrEmail">
      <ElInput
        v-model="formModel.usernameOrEmail"
        :placeholder="i18nStore.t('loginPlaceholderUsernameOrEmail')()"
        name="username"
        class="poto-el-input-line"
      >
        <template #prefix>
          <RiUser4Line size="16px"></RiUser4Line>
        </template>
      </ElInput>
    </ElFormItem>
    <ElFormItem prop="password">
      <ElInput
        v-model="formModel.password"
        type="password"
        showPassword
        :placeholder="i18nStore.t('loginPlaceholderPassword')()"
        name="password"
        class="poto-el-input-line"
      >
        <template #prefix>
          <RiLockLine size="16px"></RiLockLine>
        </template>
      </ElInput>
    </ElFormItem>
  </ElForm>
  <ElButton
    :loading="isSubmitting"
    class="w-full"
    type="primary"
    round
    size="large"
    @click="submit()"
  >
    <span class="font-bold">
      {{ i18nStore.t('loginButtonText')() }}
    </span>
  </ElButton>
  <div class="relative h-2">
    <div class="absolute top-2 flex w-full items-center justify-between">
      <!-- 游客模式 -->
      <div class="flex flex-1 justify-start truncate">
        <!-- 允许所有人查看时才显示游客模式 -->
        <span
          v-if="allowAnonymousView"
          class="mx-2 cursor-pointer truncate text-xs text-el-primary hover:text-el-primary-light-3"
          @click="
            // 跳转至首页
            $router.push(routerDict.ChatHome.path)
          "
        >
          {{ i18nStore.t('loginVisitorText')() }}
        </span>
      </div>
      <!-- 忘记密码 -->
      <div class="flex flex-1 justify-end truncate">
        <span
          class="mx-2 cursor-pointer truncate text-xs text-el-primary hover:text-el-primary-light-3"
          @click="clickForgotPassword"
        >
          {{ i18nStore.t('loginForgetText')() }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.el-form {
  :deep() {
    .el-form-item__error {
      // position: static;
      z-index: 1;
    }
  }
}
</style>
