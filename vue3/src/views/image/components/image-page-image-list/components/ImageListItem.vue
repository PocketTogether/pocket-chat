<script setup lang="ts">
import type { ImagesResponseWithBaseExpand } from '@/api'
import {
  appUserDefaultAvatar,
  fileUserAvatarConfig,
  imageGetDprFn,
  imagePbImageDataChooseByTargetSizeScaleFactorConfig,
} from '@/config'
import { pb } from '@/lib'
import { pbImageDataChooseByTargetSizeWithUrl } from '@/utils'
import type { ImageSelectListDesuwaType } from './dependencies'
import { useRouterHistoryTool } from '@/composables'

const props = defineProps<{
  imageData: ImagesResponseWithBaseExpand
  itemWidth: number
  itemHeight: number
  imageSelectListDesuwa: ImageSelectListDesuwaType
}>()

const {
  //
  imageSelectListFindById,
  imageSelectListSwitch,
} = props.imageSelectListDesuwa

// 是否已选中
const isItemSelectAlready = computed(
  () => imageSelectListFindById(props.imageData.id) != null
)
// 选中当前
const itemSwitch = () => {
  imageSelectListSwitch(props.imageData)
}

// 获取 dpr ，几倍屏
const dpr = imageGetDprFn()

const imageUrl = computed(() => {
  return pbImageDataChooseByTargetSizeWithUrl(props.imageData, {
    targetWidth:
      props.itemWidth *
      dpr *
      imagePbImageDataChooseByTargetSizeScaleFactorConfig,
    targetHeight:
      props.itemHeight *
      dpr *
      imagePbImageDataChooseByTargetSizeScaleFactorConfig,
  }).url
})

// 头像
const imageAuthorAvatarUrl = computed(() => {
  // expand.author == null 这是异常（可能pb配置或前端api调用有误），但不抛错了，返回默认头像算了
  if (props.imageData.expand?.author == null) {
    console.error('expand.author  == null')
    return appUserDefaultAvatar
  }
  // 无头像，返回默认头像
  if (props.imageData.expand.author.avatar === '') {
    return appUserDefaultAvatar
  }
  // 有头像，返回头像url
  return pb.files.getURL(
    props.imageData.expand.author,
    props.imageData.expand.author.avatar,
    { thumb: fileUserAvatarConfig.thumb100x100 }
  )
})

const {
  // 跳转至图片详情页的方法
  routerGoImageInfoPage,
} = useRouterHistoryTool()

const goImageInfoPage = () => {
  routerGoImageInfoPage({
    imageId: props.imageData.id,
    presetImageGetOneData: props.imageData,
  })
}
</script>

<template>
  <div
    class="h-full bg-color-background-mute bg-cover bg-center"
    :style="{
      backgroundImage: `url(${imageUrl})`,
    }"
  >
    <div
      class="image-mask flex h-full cursor-pointer items-end justify-between overflow-hidden"
      :class="{
        isItemSelectAlready: isItemSelectAlready,
      }"
      @click="itemSwitch"
    >
      <!-- 选择标识 -->
      <div>
        <div
          class="select-flag flow-root rounded-tr-[14px] bg-el-success opacity-95"
        >
          <div class="m-[6px] text-white">
            <RiCheckFill size="16px"></RiCheckFill>
          </div>
        </div>
      </div>
      <!-- 垫片 -->
      <div class="w-[4px]"></div>
      <!-- 头像与跳转 -->
      <div class="flex-1">
        <div
          class="avatar-go flow-root cursor-pointer rounded-tl-[14px] bg-el-primary opacity-95"
          @click.stop="goImageInfoPage"
        >
          <div class="flex items-center">
            <!-- 头像 -->
            <div class="">
              <div
                class="m-[3px] h-[22px] w-[22px] rounded-full bg-color-background-mute bg-cover bg-center"
                :style="{
                  backgroundImage: `url(${imageAuthorAvatarUrl})`,
                }"
              ></div>
            </div>

            <!-- 跳转 -->
            <div class="flex flex-1 items-center justify-center">
              <div class="m-[5px] text-white">
                <RiArrowRightLine size="18px"></RiArrowRightLine>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.image-mask {
  transition: background-color 300ms;
  background-color: transparent;
  .select-flag {
    transform: translateY(110%); // 默认藏在下面
    transition: transform 300ms ease;
  }
  .avatar-go {
    transform: translateY(110%); // 默认藏在下面
    transition: transform 300ms ease;
  }
  &:hover {
    background-color: var(--color-background-a20);
    .avatar-go {
      transform: translateY(0); // 向上平移显示
    }
  }
  &.isItemSelectAlready {
    background-color: var(--color-background-a30);
    .select-flag {
      transform: translateY(0); // 向上平移显示
    }
    .avatar-go {
      transform: translateY(0); // 向上平移显示
    }
  }
}
</style>
