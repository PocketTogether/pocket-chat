<script setup lang="ts">
import type { ImagesResponseWithBaseExpand } from '@/api'
import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import { pb } from '@/lib'

// const bgTwcssDefault = 'bg-color-background'
const bgTwcssDefault = 'bg-color-background-width-linear-gradient'

// IGVSoltHoverSlideInfoGo.vue
// 其用法是用于 ImageGroupViewer 的插槽中，加上它就能实现悬停时，下方将平移出现一个块，点击这个块就能转到图片详情页面
const props = withDefaults(
  defineProps<{
    imageItem: ImagesResponseWithBaseExpand
    onSlideClick?: () => unknown
    bgTwcss?: string
  }>(),
  {
    onSlideClick: () => {},
    bgTwcss: bgTwcssDefault,
  }
)

// 头像
const imageAuthorAvatarUrl = computed(() => {
  // expand.author == null 这是异常（可能pb配置或前端api调用有误），但不抛错了，返回默认头像算了
  if (props.imageItem.expand?.author == null) {
    console.error('expand.author  == null')
    return appUserDefaultAvatar
  }
  // 无头像，返回默认头像
  if (props.imageItem.expand.author.avatar === '') {
    return appUserDefaultAvatar
  }
  // 有头像，返回头像url
  return pb.files.getURL(
    props.imageItem.expand.author,
    props.imageItem.expand.author.avatar,
    { thumb: fileUserAvatarConfig.thumb100x100 }
  )
})
</script>

<template>
  <div class="h-full">
    <div
      class="image-mask flex h-full items-end justify-center overflow-hidden"
    >
      <div class="w-[50%] min-w-[80px] max-w-[200px]">
        <div
          class="avatar-go flow-root cursor-pointer rounded-t-[14px]"
          :class="bgTwcss"
          @click.stop="onSlideClick"
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
              <div class="m-[5px] text-color-text">
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
}

.bg-color-background-width-linear-gradient {
  background: linear-gradient(
    to top,
    var(--color-background),
    var(--color-background-a90)
  );
}
</style>
