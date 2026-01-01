<script setup lang="ts">
import { pb } from '@/lib'
import type { ImageSelectListDesuwaType } from './dependencies'
import { pbImageDataChooseBySmallestWithUrl } from '@/utils'
import { useI18nStore, useSelectionImageStore } from '@/stores'
import { useRouter } from 'vue-router'
import { useRouterHistoryTool } from '@/composables'
import { routerDict } from '@/config'
import { useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/queries'

const props = defineProps<{
  imageSelectListDesuwa: ImageSelectListDesuwaType
}>()

const {
  //
  imageSelectList,
  imageSelectListClear,
} = props.imageSelectListDesuwa

const selectionImageStore = useSelectionImageStore()

const { routerBackSafe } = useRouterHistoryTool()

const canImageSelectSubmit = computed(() => {
  if (imageSelectList.value.length <= 0) {
    return false
  }
  return true
})

const queryClient = useQueryClient()

const imageSelectSubmit = () => {
  if (!canImageSelectSubmit.value) {
    return
  }
  selectionImageStore.set(imageSelectList.value)
  // 图片选择后，设置imageInfoMessageListQuery失效
  imageSelectList.value.forEach((i) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.imageInfoMessageList(i.id),
    })
  })
  routerBackSafe({
    fallbackTo: routerDict.ChatHome.path,
  })
}

const i18nStore = useI18nStore()
</script>

<template>
  <div class="image-page-bottom-bar relative flow-root">
    <div
      class="image-page-bottom-box relative z-[3] flow-root bg-color-background-soft pb-1"
    >
      <div class="my-2 flex items-center justify-between">
        <!-- 左按钮 取消 -->
        <div class="mx-2">
          <ElButton
            circle
            type="info"
            :disabled="imageSelectList.length <= 0"
            @click="imageSelectListClear"
          >
            <template #icon>
              <RiCloseFill></RiCloseFill>
            </template>
          </ElButton>
        </div>
        <div class="flex-1 truncate">
          <!-- 图片选择 -->
          <div v-if="imageSelectList.length > 0">
            <div class="flex items-center justify-center">
              <div v-for="item in imageSelectList" :key="item.id">
                <div class="mx-[4px] overflow-hidden rounded-[4px]">
                  <div
                    class="h-[30px] w-[30px] bg-cover bg-center"
                    :style="{
                      backgroundImage: `url(${pbImageDataChooseBySmallestWithUrl(item).url})`,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <!-- 提示 -->
          <div v-else>
            <div
              class="select-none truncate px-1 text-center text-[14px] font-bold italic text-color-text-soft"
            >
              {{ i18nStore.t('imagePageBottomBarSelectText')() }}
            </div>
          </div>
        </div>
        <!-- 右按钮 确认 -->
        <div class="mx-2">
          <!-- 确认 -->
          <ElButton
            class=""
            circle
            type="primary"
            :disabled="!canImageSelectSubmit"
            @click="imageSelectSubmit"
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
