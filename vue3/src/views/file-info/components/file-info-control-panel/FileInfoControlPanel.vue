<script setup lang="ts">
import { useUserPermissionsDesuwa } from '@/composables'
import {
  UpdateFileDescription,
  UpdateFileFileName,
  UpdateFileIsDeleted,
  UpdateFileKeyword,
  UserInfoAndLinkButton,
} from './components'
import type { FileInfoQueryDesuwaType } from './dependencies'
import { FileContentCard } from '@/components'

const props = defineProps<{
  fileInfoQueryDesuwa: FileInfoQueryDesuwaType
}>()

const {
  //
  filesGetOneQuery,
  fileInfoQueryStatus,
  fileInfoMessageListQuery,
  isAuthorCurrent,
  fileInfoDataWithRealtime,
} = props.fileInfoQueryDesuwa

const { permissionUploadFile } = useUserPermissionsDesuwa()
</script>

<template>
  <div>
    <!-- 用户信息 与 文件链接按钮 -->
    <!-- UserInfoAndLinkButton -->
    <div>
      <UserInfoAndLinkButton
        :fileInfoQueryDesuwa="fileInfoQueryDesuwa"
      ></UserInfoAndLinkButton>
    </div>
    <!-- 操作面板 -->
    <div class="mt-2">
      <div class="overflow-hidden rounded-[24px] bg-color-background-soft">
        <!-- 文件内容卡片 -->
        <div>
          <div class="mx-[15px] my-[12px] text-color-text">
            <FileContentCard
              v-if="fileInfoDataWithRealtime != null"
              :fileData="fileInfoDataWithRealtime"
              isPrioritizeDisplayingFileType
            ></FileContentCard>
          </div>
        </div>
        <!-- 分割线 -->
        <div class="border-t-[3px] border-color-background"></div>
        <!-- 修改文件名 -->
        <UpdateFileFileName
          :fileInfoQueryDesuwa="fileInfoQueryDesuwa"
        ></UpdateFileFileName>
        <!-- 分割线 -->
        <div class="border-t-[3px] border-color-background"></div>
        <!-- 修改描述 -->
        <UpdateFileDescription
          :fileInfoQueryDesuwa="fileInfoQueryDesuwa"
        ></UpdateFileDescription>
        <!-- 分割线 -->
        <div class="border-t-[3px] border-color-background"></div>
        <!-- 修改关键词 -->
        <UpdateFileKeyword
          :fileInfoQueryDesuwa="fileInfoQueryDesuwa"
        ></UpdateFileKeyword>
        <Transition name="fade" mode="out-in">
          <div
            v-if="
              fileInfoMessageListQuery.data.value != null &&
              fileInfoMessageListQuery.data.value.totalItems <= 0 &&
              isAuthorCurrent &&
              permissionUploadFile
            "
          >
            <!-- 分割线 -->
            <div class="border-t-[3px] border-color-background"></div>
            <!-- 删除文件 无消息使用此文件时才显示，且需为发送者 -->
            <!-- UpdateFileIsDeleted -->
            <UpdateFileIsDeleted
              :fileInfoQueryDesuwa="fileInfoQueryDesuwa"
            ></UpdateFileIsDeleted>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
