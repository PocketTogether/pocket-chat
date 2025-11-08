<script setup lang="ts">
import {
  Collections,
  onPbResErrorStatus401AuthClear,
  pb,
  type Update,
} from '@/lib'
import { queryKeys, queryRetryPbNetworkError, useProfileQuery } from '@/queries'
import { useI18nStore } from '@/stores'
import { compareDatesSafe, potoMessage } from '@/utils'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchWithTimeoutPreferred } from '@/utils'
import { pbUsersUpdateNameBioApi } from '@/api'

const i18nStore = useI18nStore()

// 个人信息查询
const profileQuery = useProfileQuery()

// 当前表单数据
const name = ref('')
const bio = ref('')

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

  if (profileQuery.data.value.name !== name.value) {
    return false
  }
  if (profileQuery.data.value.bio !== bio.value) {
    return false
  }

  return true
})

// 初始化表单数据
const initData = () => {
  if (profileQuery.data.value == null) {
    return
  }
  name.value = profileQuery.data.value.name
  bio.value = profileQuery.data.value.bio
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

// 取消按钮函数
const cancelFn = () => {
  setEdited(false)
  initData()
}

const queryClient = useQueryClient()

// 修改名称与简介mutation
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
    const pbRes = await pbUsersUpdateNameBioApi({
      name: name.value,
      bio: bio.value,
    })

    console.log(pbRes)
    return pbRes
  },
  // ✅ 在网络错误时重试
  retry: queryRetryPbNetworkError,
  // 成功之后的处理
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
  // 失败之后的处理
  onError: (error) => {
    potoMessage({
      type: 'error',
      message: i18nStore.t('messageUpdateFailure')(),
    })
  },
})
const isSubmitting = mutation.isPending
const submit = mutation.mutateAsync
</script>

<template>
  <!-- 修改昵称简介组件 -->
  <div>
    <!-- 内容标题 -->
    <div class="mb-3 ml-3 text-sm font-bold text-color-text-soft">
      {{ i18nStore.t('settingProfileUpdateNameBioContentTitle')() }}
    </div>
    <!-- 表单盒子 -->
    <div class="mx-auto max-w-[500px]">
      <!-- 表单行 -->
      <div class="mb-3">
        <!-- 输入框标题 -->
        <div class="mb-[2px] ml-[25px] text-[12px] leading-[12px]">
          {{ i18nStore.t('settingProfileUpdateNameBioNameLabel')() }}
        </div>
        <!-- 输入框 -->
        <ElInput
          v-model="name"
          size="large"
          :placeholder="
            i18nStore.t('settingProfileUpdateNameBioNamePlaceholder')()
          "
          class="poto-el-input-line placeholder-inputText"
          @focus="
            // 输入框获取焦点时，设置为已编辑
            setEdited(true)
          "
        >
          <template #prefix>
            <RiUserLine size="16px"></RiUserLine>
          </template>
        </ElInput>
      </div>
      <!-- 表单行 -->
      <div class="mb-3">
        <!-- 输入框标题 -->
        <div class="mb-[2px] ml-[25px] text-[12px] leading-[12px]">
          {{ i18nStore.t('settingProfileUpdateNameBioBioLabel')() }}
        </div>
        <!-- 输入框 -->
        <ElInput
          v-model="bio"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 20 }"
          resize="none"
          class="poto-el-input-line placeholder-textareaText"
          :placeholder="
            i18nStore.t('settingProfileUpdateNameBioBioPlaceholder')()
          "
          @focus="
            // 输入框获取焦点时，设置为已编辑
            setEdited(true)
          "
        ></ElInput>
      </div>
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

<style lang="scss" scoped>
.el-input.placeholder-inputText :deep(input::placeholder) {
  color: #777777 !important;
  opacity: 1;
}

.el-textarea.placeholder-textareaText :deep(textarea::placeholder) {
  color: #777777 !important;
  opacity: 1; // 确保颜色不被降低透明度
}
</style>
