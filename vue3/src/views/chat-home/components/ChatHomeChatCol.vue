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
  // 修复拖出浏览器窗口时，dragCounter 不归零导致的遮罩不消失问题
  if (
    e.clientX <= 0 ||
    e.clientY <= 0 ||
    e.clientX >= window.innerWidth ||
    e.clientY >= window.innerHeight
  ) {
    dragCounter = 0
    isDragging.value = false
    isHoveringFileZone.value = false
    isHoveringImageZone.value = false
    return
  }
  // 过滤非文件
  if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
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

  // 暂存
  uploadFileStore.dropFilesSet(Array.from(files))
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

  uploadImageStore.dropImagesSet(images)
  // 跳转
  router.push(routerDict.ImageSelectPage.path)
}
</script>

<template>
  <div
    ref="dragRef"
    class="relative min-h-dvh"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <!-- 用来识别 文件/图片 的拖拽上传 -->
    <Transition name="fade" mode="out-in">
      <div
        v-if="isDragging"
        class="absolute bottom-0 left-[-2000px] right-[-2000px] top-0 z-50 bg-color-background-a80 backdrop-blur-md"
      >
        <!-- 固定窗口位置 -->
        <div class="sticky top-0 flex h-dvh w-full">
          <!-- 显示 文件/图片 -->
          <div
            class="mx-[2000px] mb-[52px] mt-[40px] flex w-full flex-col gap-[8px]"
          >
            <!-- 文件 -->
            <div
              ref="FolderRef"
              class="zone-animate flex flex-1 border-[3.5px] border-dashed"
              :class="[
                isHoveringFileZone ? 'border-glow' : 'border-color-text-soft',
                FilesOrImages
                  ? 'active-style rounded-b-[8px] rounded-t-[24px]'
                  : 'normal-style rounded-[24px]',
              ]"
              @dragenter="handleFileZoneDragEnter"
              @dragleave="handleFileZoneDragLeave"
              @dragover="handleZoneDragOver"
              @drop="handleFileDrop"
            >
              <!-- 文字容器 -->
              <div
                class="pointer-events-none flex h-full w-full flex-col items-center justify-center gap-2 text-[20px] font-bold text-color-text-soft transition-all duration-500 ease-out"
                :class="isHoveringFileZone ? 'opacity-100' : 'opacity-70'"
              >
                <RiFolderLine
                  size="40px"
                  class="pointer-events-none"
                ></RiFolderLine>
                <h1 class="pointer-events-none">
                  {{
                    isHoveringFileZone
                      ? i18nStore.t('chatDragZoneReleaseText')()
                      : i18nStore.t('chatDragZoneFilePlaceholderText')()
                  }}
                </h1>
              </div>
            </div>
            <!-- 图片 -->
            <div
              v-if="FilesOrImages"
              ref="ImageRef"
              class="zone-animate flex flex-1 rounded-b-[24px] rounded-t-[8px] border-[3.5px] border-dashed"
              :class="
                isHoveringImageZone ? 'border-glow' : 'border-color-text-soft'
              "
              @dragenter="handleImageZoneDragEnter"
              @dragleave="handleImageZoneDragLeave"
              @dragover="handleZoneDragOver"
              @drop="handleImageDrop"
            >
              <!-- 文字容器 -->
              <div
                class="pointer-events-none flex h-full w-full flex-col items-center justify-center gap-2 text-[20px] font-bold text-color-text-soft transition-all duration-500 ease-out"
                :class="isHoveringImageZone ? 'opacity-100' : 'opacity-70'"
              >
                <RiImageLine
                  size="40px"
                  class="pointer-events-none"
                ></RiImageLine>
                <h1 class="pointer-events-none">
                  {{
                    isHoveringImageZone
                      ? i18nStore.t('chatDragZoneReleaseText')()
                      : i18nStore.t('chatDragZoneImagePlaceholderText')()
                  }}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
.zone-animate {
  transition:
    border-color 0.28s ease,
    box-shadow 0.28s ease;
}

.border-glow {
  border-color: white;

  box-shadow:
    0 0 16px rgba(255, 255, 255, 0.14),
    0 10px 32px rgba(255, 255, 255, 0.06);
}
</style>
