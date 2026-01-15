<script setup lang="ts">
import type { FilesResponseWithBaseExpand } from '@/api'
import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import { pb } from '@/lib'
import type { FileSelectListDesuwaType } from './dependencies'
import { useRouterHistoryTool } from '@/composables'
import { formatFileSize } from '@/utils'
import { FileContentCard, FileContentCardLong } from '@/components'

const props = defineProps<{
  fileData: FilesResponseWithBaseExpand
  fileSelectListDesuwa: FileSelectListDesuwaType
  layoutBoxWidth: number
}>()

const {
  //
  fileSelectListFindById,
  fileSelectListSwitch,
} = props.fileSelectListDesuwa

// 是否已选中
const isItemSelectAlready = computed(
  () => fileSelectListFindById(props.fileData.id) != null
)
// 选中当前
const itemSwitch = () => {
  fileSelectListSwitch(props.fileData)
}

// 头像
const fileAuthorAvatarUrl = computed(() => {
  // expand.author == null 这是异常（可能pb配置或前端api调用有误），但不抛错了，返回默认头像算了
  if (props.fileData.expand?.author == null) {
    console.error('expand.author  == null')
    return appUserDefaultAvatar
  }
  // 无头像，返回默认头像
  if (props.fileData.expand.author.avatar === '') {
    return appUserDefaultAvatar
  }
  // 有头像，返回头像url
  return pb.files.getURL(
    props.fileData.expand.author,
    props.fileData.expand.author.avatar,
    { thumb: fileUserAvatarConfig.thumb100x100 }
  )
})

const {
  // 跳转至图片详情页的方法
  routerGoFileInfoPage,
} = useRouterHistoryTool()

const goFileInfoPage = () => {
  routerGoFileInfoPage({
    fileId: props.fileData.id,
    presetFileGetOneData: props.fileData,
  })
}
</script>

<template>
  <div>
    <div
      class="flow-root cursor-pointer select-none transition-colors"
      :class="{
        'bg-el-primary-light-6': isItemSelectAlready,
        // 'hover:bg-color-background-mute': !isItemSelectAlready,
      }"
      @click="itemSwitch"
    >
      <div class="mx-[15px] my-[10px]">
        <!-- 左内容，右按钮 -->
        <div class="flex items-center">
          <!-- 内容 -->
          <div class="flex-1 truncate">
            <div class="text-color-text">
              <FileContentCardLong
                v-if="layoutBoxWidth > 550"
                :fileData="fileData"
              ></FileContentCardLong>
              <FileContentCard v-else :fileData="fileData"></FileContentCard>
            </div>
          </div>
          <!-- 按钮 -->
          <div class="ml-3">
            <div>
              <ElButton circle type="primary" @click="goFileInfoPage">
                <template #icon>
                  <RiArrowRightLine></RiArrowRightLine>
                </template>
              </ElButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
