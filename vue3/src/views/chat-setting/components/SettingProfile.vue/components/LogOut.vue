<script setup lang="ts">
import { ConfirmContainer } from '@/components'
import { pb } from '@/lib'
import { useI18nStore } from '@/stores'

const i18nStore = useI18nStore()

// 遮罩确认框
const refConfirmContainer = ref<InstanceType<typeof ConfirmContainer> | null>(
  null
)

const submit = async () => {
  // 遮罩确认框
  await refConfirmContainer.value?.confirm()

  // 退出登录即清除authStore
  pb.authStore.clear()
}
</script>

<template>
  <!-- 退出登录组件 -->
  <div>
    <!-- 遮罩确认框 -->
    <ConfirmContainer
      ref="refConfirmContainer"
      backgroundColorTwcss="bg-color-background-soft"
      confirmType="danger"
      :title="
        // 遮罩确认框内容
        // '确认要退出登录吗'
        i18nStore.t('settingProfileLogOutConfirmContainerTitle')()
      "
      size="small"
    >
      <!-- 内容标题 -->
      <div class="mb-3 ml-3 text-sm font-bold text-color-text-soft">
        <!-- 退出登录 -->
        {{ i18nStore.t('settingProfileLogOutContentTitle')() }}
      </div>
      <!-- 按钮盒子 -->
      <div class="poto-setting-button-box not-center">
        <ElButton type="danger" round @click="submit()">
          <!-- 退出登录 -->
          {{ i18nStore.t('settingProfileLogOutButtonSubmitText')() }}
        </ElButton>
      </div>
    </ConfirmContainer>
  </div>
</template>

<style lang="scss" scoped></style>
