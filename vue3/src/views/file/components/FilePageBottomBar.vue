<script setup lang="ts">
import { pb } from '@/lib'
import type { FileSelectListDesuwaType } from './dependencies'
import { useAuthStore, useI18nStore, useSelectionFileStore } from '@/stores'
import { useRouter } from 'vue-router'
import { useRouterHistoryTool, useUserPermissionsDesuwa } from '@/composables'
import { routerDict } from '@/config'
import { useQueryClient } from '@tanstack/vue-query'
import { queryKeys } from '@/queries'

const props = defineProps<{
  fileSelectListDesuwa: FileSelectListDesuwaType
}>()

const {
  //
  fileSelectList,
  fileSelectListClear,
} = props.fileSelectListDesuwa

const selectionFileStore = useSelectionFileStore()

const { routerBackSafe } = useRouterHistoryTool()

const authStore = useAuthStore()

const { permissionSendMessage } = useUserPermissionsDesuwa()

const canFileSelectSubmit = computed(() => {
  // 未登录时不能确认
  if (authStore.isValid === false || authStore.record?.id == null) {
    return false
  }
  // 无发送消息权限时不能确认
  if (permissionSendMessage.value === false) {
    return false
  }
  // 未选择文件时不能确认
  if (fileSelectList.value.length <= 0) {
    return false
  }
  return true
})

const queryClient = useQueryClient()

const fileSelectSubmit = () => {
  if (!canFileSelectSubmit.value) {
    return
  }
  selectionFileStore.set(fileSelectList.value)
  // 文件选择后，设置fileInfoMessageListQuery失效
  fileSelectList.value.forEach((i) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.fileInfoMessageList(i.id),
    })
  })
  routerBackSafe({
    fallbackTo: routerDict.ChatHome.path,
  })
}

const i18nStore = useI18nStore()
</script>

<template>
  <div class="file-page-bottom-bar relative flow-root">
    <!-- bar-box 补丁，为解决firefox中盒子边缘与外阴影的缝隙问题 -->
    <div
      class="pointer-events-none absolute bottom-0 left-[-0.5px] right-[-0.5px] top-[-0.5px] z-[4] rounded-t-[24px] border-2 border-color-background-soft"
    ></div>
    <div
      class="file-page-bottom-box bar-box relative z-[3] flow-root bg-color-background-soft pb-1"
    >
      <div class="my-2 flex items-center justify-between">
        <!-- 左按钮 取消 -->
        <div class="mx-2">
          <ElButton
            circle
            type="info"
            :disabled="fileSelectList.length <= 0"
            @click="fileSelectListClear"
          >
            <template #icon>
              <RiCloseFill></RiCloseFill>
            </template>
          </ElButton>
        </div>
        <div class="flex-1 truncate">
          <!-- 文件选择 -->
          <div v-if="fileSelectList.length > 0">
            <!-- <div class="flex items-center justify-center">
              <div v-for="item in fileSelectList" :key="item.id">
                <div class="mx-[4px] overflow-hidden rounded-[4px]">
                  <div
                    class="h-[30px] w-[30px] bg-cover bg-center"
                    :style="{
                      backgroundFile: `url(${pbFileDataChooseBySmallestWithUrl(item).url})`,
                    }"
                  ></div>
                </div>
              </div>
            </div> -->
          </div>
          <!-- 提示 -->
          <div v-else>
            <div
              class="select-none truncate px-1 text-center text-[14px] font-bold italic text-color-text-soft"
            >
              {{ i18nStore.t('filePageBottomBarSelectText')() }}
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
            :disabled="!canFileSelectSubmit"
            @click="fileSelectSubmit"
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
.file-page-bottom-box {
  border-radius: 24px 24px 0 0;
  box-shadow: 0 0 6px 6px var(--color-background);
}
</style>
