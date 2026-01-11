<script setup lang="ts">
import { useI18nStore } from '@/stores'
import LoginForm from './components/LoginForm.vue'
import LoginDarkI18n from './components/LoginDarkI18n.vue'
import RegisterForm from './components/RegisterForm.vue'
import Oauth2List from './components/Oauth2List.vue'
import { useLoginPageBoxLeftRightStyle } from './composables'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { layoutLoginPageConfig } from '@/config'
import { usePbCollectionConfigQuery } from '@/queries'

const i18nStore = useI18nStore()
useSeoMeta({
  title: computed(() => i18nStore.t('pageLogin')()),
})

// 控制左右两栏的圆角样式
const { refBoxLeft, refBoxRight, styleBoxLeftRight } =
  useLoginPageBoxLeftRightStyle()

// const refDiv = ref<HTMLElement | null>(null)
// const { width: refDivWidth } = useElementSize(refDiv)
const { width: refDivWidth } = useWindowSize()
const showCol2TrueCol1False = computed(() => {
  if (refDivWidth.value >= layoutLoginPageConfig.breakpointCol2ToCol1) {
    return true
  }
  return false
})

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const pbCollectionConfigQuery = usePbCollectionConfigQuery()

const websiteName = computed(
  () => pbCollectionConfigQuery.data.value?.['website-name']
)
const externalLinks = computed(
  () =>
    pbCollectionConfigQuery.data.value?.[
      'external-links-to-social-media-icons-etc'
    ]
)

// 是否允许注册
const allowUsersToRegister = computed(() => {
  const val = pbCollectionConfigQuery.data.value?.['allow-users-to-register']
  // val == null 只为了类型确定，理论上此值不会为空，默认为true
  if (val == null) {
    return true
  }
  return val
})

// 是否为只允许oauth2注册
const userRegisterOauth2Only = computed(() => {
  const val = pbCollectionConfigQuery.data.value?.['user-register-oauth2-only']
  // val == null 只为了类型确定，理论上此值不会为空，默认为false
  if (val == null) {
    return false
  }
  return val
})
</script>

<template>
  <div>
    <!-- isMounted实现出现时过渡动画 -->
    <Transition name="fade">
      <div v-if="isMounted" class="flex min-h-dvh items-center justify-center">
        <div class="w-full max-w-[1000px]">
          <div
            :class="{
              'mx-10': showCol2TrueCol1False,
              'mx-2': !showCol2TrueCol1False,
            }"
          >
            <!-- 标题 -->
            <div
              :class="{
                'text-5xl': showCol2TrueCol1False,
                'text-3xl': !showCol2TrueCol1False,
              }"
              class="gradient-text wrap-long-text select-none py-10 text-center font-bold"
            >
              {{ websiteName }}
            </div>
            <!-- 允许注册 -->
            <template v-if="allowUsersToRegister && !userRegisterOauth2Only">
              <!-- 大屏两列，登录与注册 -->
              <div
                v-if="showCol2TrueCol1False"
                class="flex items-center justify-center"
              >
                <!-- 左栏 -->
                <div
                  ref="refBoxLeft"
                  :style="styleBoxLeftRight.left"
                  class="flex-1 rounded-3xl bg-color-background-soft"
                >
                  <!-- 左侧上栏 -->
                  <div class="mx-auto max-w-96">
                    <div class="m-8">
                      <LoginForm></LoginForm>
                    </div>
                  </div>
                  <!-- 左侧水平分割线 -->
                  <!-- 左侧下栏 -->
                  <!-- 都在Oauth2List -->
                  <Oauth2List></Oauth2List>
                </div>
                <!-- 中间垂直分割线 -->
                <div class="w-0 border-l-[3px] border-transparent"></div>
                <!-- 右栏 -->
                <div
                  ref="refBoxRight"
                  :style="styleBoxLeftRight.right"
                  class="flex-1 rounded-3xl bg-color-background-soft"
                >
                  <div class="mx-auto max-w-96">
                    <div class="m-8">
                      <RegisterForm></RegisterForm>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 小屏一列 -->
              <div v-else class="flex items-center justify-center">
                <div
                  class="w-full max-w-[400px] rounded-3xl bg-color-background-soft"
                >
                  <div class="mx-auto max-w-96">
                    <div class="m-8">
                      <LoginForm></LoginForm>
                    </div>
                  </div>
                  <Oauth2List></Oauth2List>
                  <div class="border-t-[3px] border-color-background"></div>
                  <div class="mx-auto max-w-96">
                    <div class="m-8">
                      <RegisterForm></RegisterForm>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <!-- 不允许注册 -->
            <template v-else>
              <div class="flex items-center justify-center">
                <div
                  class="w-full rounded-3xl bg-color-background-soft"
                  :class="{
                    // 大屏，较宽
                    'max-w-[500px]': showCol2TrueCol1False,
                    // 小屏，较窄
                    'max-w-[400px]': !showCol2TrueCol1False,
                  }"
                >
                  <div class="mx-auto max-w-96">
                    <div class="m-8">
                      <LoginForm></LoginForm>
                    </div>
                  </div>
                  <Oauth2List></Oauth2List>
                </div>
              </div>
            </template>

            <!-- 图标组 -->
            <div class="m-10 flex items-center justify-center">
              <LoginDarkI18n></LoginDarkI18n>
              <template v-if="externalLinks != null">
                <div v-for="(item, index) in externalLinks" :key="index">
                  <ElTooltip :content="item.name" effect="light">
                    <a
                      class="mx-1 cursor-pointer p-1"
                      :href="item.link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i
                        :class="item.icon"
                        style="font-size: 24px; line-height: 24px"
                      ></i>
                    </a>
                  </ElTooltip>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.gradient-text {
  font-family: 'Nunito', sans-serif;
  background: linear-gradient(
    to right,
    var(--color-text) 20%,
    // var(--el-color-danger) 20%,
    var(--el-color-primary) 80%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.wrap-long-text {
  overflow-wrap: anywhere; /* 允许在任意点断行，但仍尝试保持完整词 */
  white-space: pre-wrap;
}
</style>
