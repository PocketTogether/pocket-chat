<script setup lang="ts">
import { useI18nStore } from '@/stores'
import type { ElForm } from 'element-plus'
import { useRegisterFormRules, useRegisterFormSubmit } from './composables'

const i18nStore = useI18nStore()

const formModel = ref({
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
})
// 导出类型给封装的ts文件用
export type RegisterFormFormModel = typeof formModel

const form = ref<InstanceType<typeof ElForm> | null>(null)
export type RegisterFormForm = typeof form

// 封装了表单规则相关
const {
  rules,
  isPrepareToSubmit,
  errorEmailList_validation_not_unique,
  errorUsernameList_validation_not_unique,
} = useRegisterFormRules({
  formModel,
})

// 封装了提交函数相关
const { isSubmitting, submit } = useRegisterFormSubmit({
  formModel,
  form,
  isPrepareToSubmit,
  errorEmailList_validation_not_unique,
  errorUsernameList_validation_not_unique,
})
</script>

<template>
  <ElForm
    ref="form"
    :model="formModel"
    :rules="rules"
    size="large"
    class="poto-el-form-line"
  >
    <ElFormItem prop="username">
      <ElInput
        v-model="formModel.username"
        :placeholder="i18nStore.t('registerPlaceholderUsername')()"
        class="poto-el-input-line"
        autocomplete="off"
      >
        <template #prefix>
          <RiUser4Line size="16px"></RiUser4Line>
        </template>
      </ElInput>
    </ElFormItem>
    <ElFormItem prop="email">
      <ElInput
        v-model="formModel.email"
        :placeholder="i18nStore.t('registerPlaceholderEmail')()"
        class="poto-el-input-line"
        autocomplete="off"
      >
        <template #prefix>
          <RiMailLine size="16px"></RiMailLine>
        </template>
      </ElInput>
    </ElFormItem>
    <ElFormItem prop="password">
      <ElInput
        v-model="formModel.password"
        showPassword
        :placeholder="i18nStore.t('registerPlaceholderPassword')()"
        class="poto-el-input-line"
        autocomplete="off"
      >
        <template #prefix>
          <RiLockUnlockLine size="16px"></RiLockUnlockLine>
        </template>
      </ElInput>
    </ElFormItem>
    <ElFormItem prop="passwordConfirm">
      <ElInput
        v-model="formModel.passwordConfirm"
        showPassword
        :placeholder="i18nStore.t('registerPlaceholderPasswordConfirm')()"
        class="poto-el-input-line"
        autocomplete="off"
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
      {{ i18nStore.t('registerButtonText')() }}
    </span>
  </ElButton>
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
