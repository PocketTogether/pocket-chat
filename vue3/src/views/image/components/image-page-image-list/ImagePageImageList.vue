<script setup lang="ts"></script>

<template>
  <div>
    <!-- 图片显示 -->
    <div>
      <div
        class="overflow-hidden rounded-t-[24px] border-[3px] border-transparent bg-color-background-soft"
      >
        <!-- 行 -->
        <div class="flex h-[201px] items-stretch">
          <!-- 列 -->
          <div class="flex-1">
            <div class="h-full bg-red-950"></div>
          </div>
          <!-- 分割线 -->
          <div class="border-l-[3px] border-transparent"></div>
          <!-- 列 -->
          <div class="flex-1">
            <div class="h-full bg-red-950"></div>
          </div>
          <!-- 分割线 -->
          <div class="border-l-[3px] border-transparent"></div>
          <!-- 列 -->
          <div class="flex-1">
            <div class="h-full bg-red-950"></div>
          </div>
          <!-- 分割线 -->
          <div class="border-l-[3px] border-transparent"></div>
          <!-- 列 -->
          <div class="flex-1">
            <div class="h-full bg-red-950"></div>
          </div>
          <!-- 分割线 -->
          <div class="border-l-[3px] border-transparent"></div>
          <!-- 列 -->
          <div class="flex-1">
            <div class="h-full bg-red-950"></div>
          </div>
        </div>
        <!-- 分割线 横向 -->
        <div class="border-t-[3px] border-transparent"></div>
        <!-- 行 -->
        <div class="flex h-[201px] items-stretch">
          <!-- 列 -->
          <div class="flex-1">
            <div class="h-full bg-red-950"></div>
          </div>
          <!-- 分割线 -->
          <div class="border-l-[3px] border-transparent"></div>
          <!-- 列 -->
          <div class="flex-1">
            <div class="h-full bg-red-950"></div>
          </div>
          <!-- 分割线 -->
          <div class="border-l-[3px] border-transparent"></div>
          <!-- 列 -->
          <div class="flex-1">
            <div class="h-full bg-red-950"></div>
          </div>
          <!-- 分割线 -->
          <div class="border-l-[3px] border-transparent"></div>
          <!-- 列 -->
          <div class="flex-1">
            <div class="h-full bg-red-950"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- 分割线 横向 -->
    <div class="border-t-[3px] border-transparent"></div>
    <!-- 分页栏 -->
    <div>
      <div class="overflow-hidden rounded-b-[24px] bg-color-background-soft">
        <div class="flex items-stretch">
          <!-- 上一页 -->
          <div class="flex cursor-pointer items-center">
            <div class="mx-[12px] my-[12px]">
              <RiArrowLeftWideFill></RiArrowLeftWideFill>
            </div>
          </div>
          <div class="border-l-[3px] border-color-background"></div>
          <!-- 分页按钮栏 -->
          <div class="flex-1 overflow-hidden">
            <div class="page-button-scrollbar flow-root h-full">
              <ElScrollbar
                height="100%"
                class=""
                :viewStyle="{
                  height: '100%',
                }"
              >
                <div class="flex h-full w-fit items-stretch">
                  <!-- 1 -->
                  <div
                    class="flex flex-shrink-0 cursor-pointer items-center bg-el-primary-light-6"
                  >
                    <div
                      class="mx-[12px] my-[12px] min-w-[24px] select-none text-center text-[16px] font-bold text-color-text"
                    >
                      1
                    </div>
                  </div>
                  <div class="border-l-[3px] border-color-background"></div>
                  <template v-for="item in 20" :key="item">
                    <!-- 2 -->
                    <div class="flex flex-shrink-0 cursor-pointer items-center">
                      <div
                        class="mx-[12px] my-[12px] w-[24px] select-none text-center text-[16px] font-bold text-color-text"
                      >
                        {{ 1 + item }}
                      </div>
                    </div>
                    <div class="border-l-[3px] border-color-background"></div>
                  </template>
                  <!-- 没有更多了 -->
                  <div class="flex flex-shrink-0 items-center">
                    <div
                      class="mx-[24px] my-[12px] select-none text-center text-[14px] font-bold italic text-color-text-soft"
                    >
                      没有更多了
                    </div>
                  </div>
                </div>
              </ElScrollbar>
            </div>
          </div>
          <div class="border-l-[3px] border-color-background"></div>
          <!-- 下一页 -->
          <div class="flex cursor-pointer items-center">
            <div class="mx-[12px] my-[12px]">
              <RiArrowRightWideFill></RiArrowRightWideFill>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-button-scrollbar {
  :deep() {
    .el-scrollbar {
      // overflow-x: hidden;
      // overflow: visible;
    }
    .el-scrollbar__bar.is-horizontal {
      // transform: translateY(10px);
      // bottom: -10px;
    }
  }
}
</style>
