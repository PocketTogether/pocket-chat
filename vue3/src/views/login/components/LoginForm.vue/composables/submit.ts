// src\views\login\components\LoginForm.vue\composables\submit.ts
import { useMutation } from '@tanstack/vue-query'
import { pb, Collections, onPbResErrorStatus401AuthClear } from '@/lib'
import { useI18nStore } from '@/stores'
import { fetchWithTimeoutPreferred, potoMessage } from '@/utils'
import { ClientResponseError } from 'pocketbase'
import { PotoFormValidationError } from '@/classes'
import type { LoginFormForm, LoginFormFormModel } from './dependencies'
import type { useLoginFormRules } from './rules'
import { queryRetryPbNetworkError } from '@/queries'
import { useRouter } from 'vue-router'
import { routerDict } from '@/config'
import { pbUsersAuthWithPasswordApi } from '@/api'

type LoginFormRules = ReturnType<typeof useLoginFormRules>

/**
 * 封装了提交函数相关（使用 useMutation 管理状态与副作用）
 */
export const useLoginFormSubmit = (data: {
  formModel: LoginFormFormModel
  form: LoginFormForm
  isPrepareToSubmit: LoginFormRules['isPrepareToSubmit']
}) => {
  const { formModel, form, isPrepareToSubmit } = data
  const i18nStore = useI18nStore()

  const mutation = useMutation({
    // 提交逻辑
    mutationFn: async () => {
      if (isPrepareToSubmit.value === false) {
        isPrepareToSubmit.value = true
        // 设置 isPrepareToSubmit 后，最好等待一会以免计算属性未更新
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // 表单校验
      await form.value?.validate().catch(() => {
        throw new PotoFormValidationError()
      })

      // PocketBase 登录
      const pbRes = await pbUsersAuthWithPasswordApi(
        formModel.value.usernameOrEmail,
        formModel.value.password
      )

      // console.log(pbRes)
      return pbRes
    },

    // 成功回调
    onSuccess: () => {
      potoMessage({
        type: 'success',
        message: i18nStore.t('loginSuccess')(),
      })
    },

    // 错误处理
    onError: (error) => {
      if (error instanceof ClientResponseError) {
        // 登录失败
        // ClientResponseError 400: Failed to authenticate.
        form.value?.resetFields()
        potoMessage({
          type: 'error',
          message: i18nStore.t('loginFailed')(),
        })
      } else if (error instanceof PotoFormValidationError) {
        // 这是表单校验抛出的错误，什么都不用做
      } else {
        // 未知错误
        potoMessage({
          type: 'error',
          message: i18nStore.t('loginFailedErrorUnknow')(),
        })
      }
    },

    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  const router = useRouter()

  const submit = async () => {
    await mutation.mutateAsync()
    router.push(routerDict.ChatHome.path)
  }

  return {
    isSubmitting: mutation.isPending,
    submit,
  }
}
