<script setup lang="ts">
import { routerDict } from '@/config'
import { ChatCol, ChatTopBarMoreMenuItem } from '@/components'
import { injectAppMainElScrollbar } from '@/composables'
import { usePbCollectionConfigQuery } from '@/queries'
import { useAuthStore, useI18nStore, useUploadFileStore } from '@/stores'
import { pbMessagesSendChatApi } from '@/api'
import {
  generateRandomIntegerBetween,
  generateRandomKey,
  potoMessage,
  formatFileSize,
} from '@/utils'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUserPermissionsDesuwa } from '@/composables'
import type { UploadFile } from 'element-plus'

const i18nStore = useI18nStore()

// inject获取应用主滚动实例
const appMainElScrollbar = injectAppMainElScrollbar()

const pbCollectionConfigQuery = usePbCollectionConfigQuery()

const websiteName = computed(
  () => pbCollectionConfigQuery.data.value?.['website-name'] ?? ''
)

const authStore = useAuthStore()

// 测试批量添加消息
const testPbSendMessage = async () => {
  // const sendNum = generateRandomIntegerBetween(1, 10)
  const sendNum = 10
  for (let i = 0; i < sendNum; i++) {
    await pbMessagesSendChatApi({
      content: generateRandomKey(
        generateRandomIntegerBetween(5, generateRandomIntegerBetween(20, 200))
      ),
      roomId: '',
      images: [],
      file: '',
    })
  }
}

const isDev = import.meta.env.DEV

// 关于拖拽的逻辑如下

// 最外层的遮罩
const dragRef = ref<HTMLElement | null>(null)
const uploadFileStore = useUploadFileStore()
const { permissionMaxUploadFileSize, openPermissionAdminContactNotif } =
  useUserPermissionsDesuwa()

// 是否显示
const isDragging = ref(false)
let dragCounter = 0

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  // if (e.dataTransfer?.types.includes('Files')) {
  if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
    dragCounter++
    isDragging.value = true
  }
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
    dragCounter--
    if (dragCounter === 0) {
      isDragging.value = false
    }
  }
}

// const handleDragOver = (e: DragEvent) => {
//   e.preventDefault()
//   if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
//     e.dataTransfer.dropEffect = 'copy'
//   } else {
//     e.dataTransfer.dropEffect = 'none'
//   }
// }
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()

  const dt = e.dataTransfer
  // 没有数据就退出去 确保安全（不是 NULL）
  if (!dt) return

  if (dt.types.includes('Files')) {
    dt.dropEffect = 'copy'
  } else {
    dt.dropEffect = 'none'
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  dragCounter = 0
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  for (const file of files) {
    // console.log('Dropped file:', file.name, file.type, file.size)
  }
}

// 挂载好以后注册四个拖拽方法
onMounted(() => {
  const el = dragRef.value
  if (el) {
    el.addEventListener('dragenter', handleDragEnter)
    el.addEventListener('dragleave', handleDragLeave)
    el.addEventListener('dragover', handleDragOver)
    el.addEventListener('drop', handleDrop)
  }
})

onUnmounted(() => {
  const el = dragRef.value
  if (el) {
    el.removeEventListener('dragenter', handleDragEnter)
    el.removeEventListener('dragleave', handleDragLeave)
    el.removeEventListener('dragover', handleDragOver)
    el.removeEventListener('drop', handleDrop)
  }
})
</script>

<template>
  <div ref="dragRef" class="relative h-full">
    <!-- 用来识别 文件/图片 的拖拽上传 -->
    <div
      v-if="isDragging"
      class="pointer-events-none absolute inset-0 z-50 rounded-lg"
    >
      <!-- 固定窗口位置 -->
      <div class="bg-primary sticky top-0 flex h-screen w-full">
        <div
          class="mb-16 mt-12 flex w-full flex-col gap-2 rounded-xl backdrop-blur-md"
        >
          <!-- 文件 -->
          <div
            class="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-4 border-dashed border-color-text-soft text-2xl font-bold text-color-text-soft"
          >
            <RiImageLine size="40px"></RiImageLine>
            <h1>你好 往这里拖文件喵</h1>
          </div>
          <!-- 图片 -->
          <div
            class="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-4 border-dashed border-color-text-soft text-2xl font-bold text-color-text-soft"
          >
            <RiFolderLine size="40px"></RiFolderLine>
            <h1>你好 往这里拖图片喵</h1>
          </div>
        </div>
      </div>
    </div>
    <ChatCol
      :refScrollWarp="appMainElScrollbar?.wrapRef"
      :couldGoBack="false"
      roomId=""
      :chatTitle="websiteName"
    >
      <!-- 插槽 -->
      <template #chatTopBarMoreMenu>
        <!-- 测试批量添加消息，开发时才显示 -->
        <!-- <ChatTopBarMoreMenuItem v-if="isDev" @click="testPbSendMessage">
            <template #icon>
              <RiFlaskLine size="18px"></RiFlaskLine>
            </template>
            <template #text> 测试批量添加消息 </template>
          </ChatTopBarMoreMenuItem> -->

        <!-- 转到设置，已登录时才显示 -->
        <ChatTopBarMoreMenuItem
          v-if="authStore.isValid"
          @click="$router.push(routerDict.ChatSetting.path)"
        >
          <template #icon>
            <RiSettingsLine size="18px"></RiSettingsLine>
          </template>
          <template #text> {{ i18nStore.t('pageSetting')() }} </template>
        </ChatTopBarMoreMenuItem>

        <!-- 动态 -->
        <ChatTopBarMoreMenuItem @click="$router.push(routerDict.LivePage.path)">
          <template #icon>
            <RiEarthLine size="18px"></RiEarthLine>
          </template>
          <template #text> {{ i18nStore.t('pageLive')() }} </template>
        </ChatTopBarMoreMenuItem>

        <!-- 成员 -->
        <ChatTopBarMoreMenuItem
          @click="$router.push(routerDict.UserListPage.path)"
        >
          <template #icon>
            <RiGroupLine size="18px"></RiGroupLine>
          </template>
          <template #text> {{ i18nStore.t('pageUserList')() }} </template>
        </ChatTopBarMoreMenuItem>

        <!-- 搜索 -->
        <ChatTopBarMoreMenuItem
          @click="$router.push(routerDict.SearchPage.path)"
        >
          <template #icon>
            <!-- 微调 -->
            <RiSearchLine size="18px" class="translate-y-[1px]"></RiSearchLine>
          </template>
          <template #text> {{ i18nStore.t('pageSearch')() }} </template>
        </ChatTopBarMoreMenuItem>
      </template>
    </ChatCol>
  </div>
</template>

<style lang="scss" scoped></style>
