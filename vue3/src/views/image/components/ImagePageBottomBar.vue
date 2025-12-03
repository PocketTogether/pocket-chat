<script setup lang="ts"></script>

<template>
  <div class="image-page-bottom-bar relative flow-root">
    <div
      class="image-page-bottom-box relative z-[3] flow-root bg-color-background-soft pb-1"
    >
      <div class="my-2 flex items-center justify-between">
        <!-- 左按钮 取消 -->
        <div class="mx-2">
          <ElButton circle type="info" :disabled="false" @click="() => {}">
            <template #icon>
              <RiCloseFill></RiCloseFill>
            </template>
          </ElButton>
        </div>
        <!-- 内容 -->
        <div class="truncate">
          <div
            class="select-none truncate text-[14px] font-bold text-color-text"
          >
            请选择图片
          </div>
        </div>
        <!-- 右按钮 确认 -->
        <div class="mx-2">
          <!-- 确认 -->
          <ElButton
            class=""
            circle
            type="primary"
            :disabled="false"
            @click="() => {}"
          >
            <template #icon>
              <RiCheckFill></RiCheckFill>
            </template>
          </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-page-bottom-box {
  border-radius: 24px 24px 0 0;
  box-shadow: 0 0 6px 6px var(--color-background);
}
</style>
