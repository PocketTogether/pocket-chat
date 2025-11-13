import { useMutation } from '@tanstack/vue-query'
import { PotoFormValidationError } from '@/classes'
import { pb, Collections, type Create } from '@/lib'
import { useI18nStore } from '@/stores'
import { fetchWithTimeoutPreferred, potoMessage } from '@/utils'
import { ClientResponseError } from 'pocketbase'
import type { useRegisterFormRules } from './rules'
import type { RegisterFormForm, RegisterFormFormModel } from './dependencise'
import { queryRetryPbNetworkError } from '@/queries'
import { pbUsersCreateRegisterApi } from '@/api'

type RegisterFormRules = ReturnType<typeof useRegisterFormRules>

/**
 * 封装了提交函数相关（使用 useMutation 管理状态与副作用）
 */
export const useRegisterFormSubmit = (data: {
  formModel: RegisterFormFormModel
  form: RegisterFormForm
  isPrepareToSubmit: RegisterFormRules['isPrepareToSubmit']
  errorEmailList_validation_not_unique: RegisterFormRules['errorEmailList_validation_not_unique']
  errorUsernameList_validation_not_unique: RegisterFormRules['errorUsernameList_validation_not_unique']
}) => {
  const {
    formModel,
    form,
    isPrepareToSubmit,
    errorEmailList_validation_not_unique,
    errorUsernameList_validation_not_unique,
  } = data

  const i18nStore = useI18nStore()

  const mutation = useMutation({
    // 提交逻辑
    mutationFn: async () => {
      // 提交前，优化调整一些校验规则
      if (isPrepareToSubmit.value === false) {
        isPrepareToSubmit.value = true
        // 设置 isPrepareToSubmit 后，最好等待一会以免计算属性未更新
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      // 表单校验
      await form.value?.validate().catch(() => {
        throw new PotoFormValidationError()
      })

      // 通过 pocketbase SDK 请求
      const pbRes = await pbUsersCreateRegisterApi({
        username: formModel.value.username,
        email: formModel.value.email,
        password: formModel.value.password,
        passwordConfirm: formModel.value.passwordConfirm,
      })

      // console.log(pbRes)
      return pbRes
    },

    // 一些收尾工作
    onSuccess: () => {
      form.value?.resetFields()
      isPrepareToSubmit.value = false
      potoMessage({
        type: 'success',
        message: i18nStore.t('registerSuccess')(),
      })
    },

    // 错误处理
    onError: (error) => {
      if (error instanceof ClientResponseError) {
        // 是否为已知错误
        let isKnowError = false
        if (error.data?.data?.username?.code === 'validation_not_unique') {
          // 用户名已存在
          errorUsernameList_validation_not_unique.value.push(
            formModel.value.username
          )
          // 设置为已知错误
          isKnowError = true
        }
        if (error.data?.data?.email?.code === 'validation_not_unique') {
          // 邮箱已存在
          errorEmailList_validation_not_unique.value.push(formModel.value.email)
          // 设置为已知错误
          isKnowError = true
        }
        // 为已知错误
        if (isKnowError) {
          // 触发校验以显示错误
          form.value?.validate()
        }
        // 为未知错误
        else {
          // 未知错误
          potoMessage({
            type: 'error',
            message: i18nStore.t('registerFailedErrorUnknow')(),
          })
        }
      } else if (error instanceof PotoFormValidationError) {
        // 这是表单校验抛出的错误，什么都不用做
      } else {
        // 未知错误
        potoMessage({
          type: 'error',
          message: i18nStore.t('registerFailedErrorUnknow')(),
        })
      }
    },

    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  return {
    isSubmitting: mutation.isPending,
    submit: mutation.mutateAsync,
  }
}
