<script setup lang="ts">
import { routerDict } from '@/config'
import { ChatCol, ChatTopBarMoreMenuItem } from '@/components'
import { injectAppMainElScrollbar } from '@/composables'
import { usePbCollectionConfigQuery } from '@/queries'
import {
  useAuthStore,
  useI18nStore,
  useUploadFileStore,
  useUploadImageStore,
} from '@/stores'
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
import { useRouter } from 'vue-router'

const router = useRouter()

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
const FolderRef = ref<HTMLElement | null>(null)
const ImageRef = ref<HTMLElement | null>(null)
// 暂存 文件/图片 的 stores
const uploadFileStore = useUploadFileStore()
const uploadImageStore = useUploadImageStore()
const { permissionMaxUploadFileSize, openPermissionAdminContactNotif } =
  useUserPermissionsDesuwa()

// 是否显示
const isDragging = ref(false)
// 是否高亮
const isHoveringFileZone = ref(false)
const isHoveringImageZone = ref(false)
// 是非为图片/文件
const FilesOrImages = ref(false)
let dragCounter = 0

// 文件拖拽进入区域判断
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  FilesOrImages.value = false
  // if (e.dataTransfer?.types.includes('Files')) {
  if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
    dragCounter++
    isDragging.value = true
  }
  // 查看 type 是文件还是图片
  if (e.dataTransfer?.items) {
    for (const item of e.dataTransfer.items) {
      if (item.type.startsWith('image/')) {
        FilesOrImages.value = true
        break
      }
    }
  }
}
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
    // dragCounter--
    // if (dragCounter === 0) {
    dragCounter = Math.max(0, dragCounter - 1)
    if (dragCounter <= 0) {
      dragCounter = 0
      isDragging.value = false
      isHoveringFileZone.value = false
      isHoveringImageZone.value = false
    }
  }
}
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
  isHoveringFileZone.value = false
  isHoveringImageZone.value = false

  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
}

// 高亮判断
const handleFileZoneDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isHoveringFileZone.value = true
}
const handleFileZoneDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isHoveringFileZone.value = false
}
const handleImageZoneDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isHoveringImageZone.value = true
}
const handleImageZoneDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isHoveringImageZone.value = false
}
const handleZoneDragOver = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}
// 文件的跳转上传
const handleFileDrop = (e: DragEvent) => {
  e.preventDefault()
  dragCounter = 0
  isDragging.value = false
  isHoveringFileZone.value = false
  // 暂存文件
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return
  // 做一次前端大小校验
  // 20MB
  const MAX_SIZE = 20 * 1024 * 1024
  const bigFiles = Array.from(files).filter((file) => file.size <= MAX_SIZE)
  if (bigFiles.length === 0) return

  uploadFileStore.useDropFiles = bigFiles
  // 跳转
  router.push(routerDict.FileSelectPage.path)
}
// 图片的跳转上传
const handleImageDrop = (e: DragEvent) => {
  e.preventDefault()
  dragCounter = 0
  isDragging.value = false
  isHoveringImageZone.value = false
  // 暂存图片
  const image = e.dataTransfer?.files
  if (!image || image.length === 0) return

  // 保险判断是否为图片
  const images = Array.from(image).filter((file) =>
    file.type.startsWith('image/')
  )
  if (images.length === 0) return

  uploadImageStore.useDropImages = images
  // 跳转
  router.push(routerDict.ImageSelectPage.path)
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
  // 当父元素被 v-if 条件切换时，可能会导致元素被销毁重建
  // 所以事件监听无法绑定（需要用 watch），我们直接替换成 Vue 方案

  // const folderEl = FolderRef.value
  // if (folderEl) {
  //   folderEl.addEventListener('dragenter', handleFileZoneDragEnter)
  //   folderEl.addEventListener('dragleave', handleFileZoneDragLeave)
  //   folderEl.addEventListener('dragover', handleZoneDragOver)
  // }
  // const imageEl = ImageRef.value
  // if (imageEl) {
  //   imageEl.addEventListener('dragenter', handleImageZoneDragEnter)
  //   imageEl.addEventListener('dragleave', handleImageZoneDragLeave)
  //   imageEl.addEventListener('dragover', handleZoneDragOver)
  // }
})

onUnmounted(() => {
  const el = dragRef.value
  if (el) {
    el.removeEventListener('dragenter', handleDragEnter)
    el.removeEventListener('dragleave', handleDragLeave)
    el.removeEventListener('dragover', handleDragOver)
    el.removeEventListener('drop', handleDrop)
  }
  // const folderEl = FolderRef.value
  // if (folderEl) {
  //   folderEl.removeEventListener('dragenter', handleFileZoneDragEnter)
  //   folderEl.removeEventListener('dragleave', handleFileZoneDragLeave)
  //   folderEl.removeEventListener('dragover', handleZoneDragOver)
  // }
  // const imageEl = ImageRef.value
  // if (imageEl) {
  //   imageEl.removeEventListener('dragenter', handleImageZoneDragEnter)
  //   imageEl.removeEventListener('dragleave', handleImageZoneDragLeave)
  //   imageEl.removeEventListener('dragover', handleZoneDragOver)
  // }
})
</script>

<template>
  <div ref="dragRef" class="relative h-full">
    <!-- 用来识别 文件/图片 的拖拽上传 -->
    <div v-show="isDragging" class="absolute inset-0 z-50 rounded-lg">
      <!-- 固定窗口位置 -->
      <div class="bg-primary sticky top-0 flex h-screen w-full">
        <Transition
          enterActiveClass="transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          leaveActiveClass="transition-all duration-200 ease-in"
          enterFromClass="opacity-0 scale-[0.98]"
          enterToClass="opacity-100 scale-100"
          leaveFromClass="opacity-100 scale-100"
          leaveToClass="opacity-0 scale-[0.98]"
        >
          <div
            v-if="isDragging"
            class="mb-16 mt-12 flex w-full flex-col gap-2 rounded-xl backdrop-blur-md"
          >
            <!-- 文件 -->
            <div
              ref="FolderRef"
              class="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-4 border-dashed text-2xl font-bold text-color-text-soft"
              :class="
                isHoveringFileZone ? 'border-glow' : 'border-color-text-soft'
              "
              @dragenter="handleFileZoneDragEnter"
              @dragleave="handleFileZoneDragLeave"
              @dragover="handleZoneDragOver"
              @drop="handleFileDrop"
            >
              <RiFolderLine
                size="40px"
                class="pointer-events-none"
              ></RiFolderLine>
              <h1 v-if="isHoveringFileZone" class="pointer-events-none">
                {{ i18nStore.t('chatDragZoneReleaseText')() }}
              </h1>
              <h1 v-else class="pointer-events-none">
                {{ i18nStore.t('chatDragZoneFilePlaceholderText')() }}
              </h1>
            </div>
            <!-- 图片 -->
            <div
              v-if="FilesOrImages"
              ref="ImageRef"
              class="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border-4 border-dashed border-color-text-soft text-2xl font-bold text-color-text-soft"
              :class="
                isHoveringImageZone ? 'border-glow' : 'border-color-text-soft'
              "
              @dragenter="handleImageZoneDragEnter"
              @dragleave="handleImageZoneDragLeave"
              @dragover="handleZoneDragOver"
              @drop="handleImageDrop"
            >
              <RiImageLine
                size="40px"
                class="pointer-events-none"
              ></RiImageLine>
              <h1 v-if="isHoveringImageZone" class="pointer-events-none">
                {{ i18nStore.t('chatDragZoneReleaseText')() }}
              </h1>
              <h1 v-else class="pointer-events-none">
                {{ i18nStore.t('chatDragZoneImagePlaceholderText')() }}
              </h1>
            </div>
          </div>
        </Transition>
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

<style lang="scss" scoped>
.border-glow {
  border-color: white;

  transition:
    border-color 0.28s ease,
    box-shadow 0.28s ease;

  box-shadow:
    0 0 16px rgba(255, 255, 255, 0.14),
    0 10px 32px rgba(255, 255, 255, 0.06);
}
</style>
