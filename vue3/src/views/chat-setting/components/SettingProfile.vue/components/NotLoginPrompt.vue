<script setup lang="ts">
import { routerDict } from '@/config'
import { useI18nStore } from '@/stores'
import { PocketTitle } from '@/components'

defineProps<{
  showContentTrueCol2FalseCol1: boolean
}>()

const i18nStore = useI18nStore()
</script>

<template>
  <div class="not-login-prompt">
    <!-- 未登录 -->
    <div
      :class="{
        'mt-16 text-5xl': showContentTrueCol2FalseCol1,
        'mt-10 text-3xl': !showContentTrueCol2FalseCol1,
      }"
    >
      <PocketTitle></PocketTitle>
    </div>
    <div class="wrap-long-text my-5 text-center text-lg font-bold">
      <!-- 当前未登录，登录后可查看更多内容 -->
      {{ i18nStore.t('settingProfileNotLoginPromptTitle')() }}
    </div>
    <div class="mb-10 flex items-center justify-center">
      <ElButton
        size="large"
        type="primary"
        round
        plain
        @click="$router.push(routerDict.LoginPage.path)"
      >
        <!-- 登 录 -->
        {{ i18nStore.t('settingProfileNotLoginPromptLoginText')() }}
      </ElButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gradient-text {
  font-family: 'Nunito', sans-serif;
  background: linear-gradient(
    to right,
    var(--color-text) 20%,
    // var(--el-color-danger) 20%,
    var(--el-color-primary) 80%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.wrap-long-text {
  overflow-wrap: anywhere; /* 允许在任意点断行，但仍尝试保持完整词 */
  white-space: pre-wrap;
}

.not-login-prompt {
  :deep() {
    .el-button {
      font-weight: bold;
      font-size: 16px;
      span,
      .el-icon {
        // color: var(--color-background);
        font-weight: bold;
      }
    }
  }
}
</style>
