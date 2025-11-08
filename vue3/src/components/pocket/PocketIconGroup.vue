<script setup lang="ts">
import { usePbCollectionConfigQuery } from '@/queries'
import { i18nLocaleInfo, i18nLocaleList } from '@/config'
import { useI18nStore } from '@/stores'
import { useDark } from '@vueuse/core'

const i18nStore = useI18nStore()

const isDark = useDark()

const pbCollectionConfigQuery = usePbCollectionConfigQuery()

const externalLinks = computed(
  () =>
    pbCollectionConfigQuery.data.value?.[
      'external-links-to-social-media-icons-etc'
    ]
)
</script>

<template>
  <div>
    <div class="flex items-center justify-center">
      <!-- 明暗切换 -->
      <div class="mx-1 cursor-pointer p-1" @click="isDark = !isDark">
        <RiMoonLine v-if="isDark"></RiMoonLine>
        <RiSunLine v-else></RiSunLine>
      </div>
      <!-- 语言切换 -->
      <ElDropdown trigger="click">
        <div class="mx-1 cursor-pointer p-1">
          <RiTranslate2></RiTranslate2>
        </div>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem
              v-for="key in i18nLocaleList"
              :key="key"
              @click="i18nStore.localeSet(key)"
            >
              <div class="flex w-full items-center justify-between">
                <span>
                  {{ i18nLocaleInfo[key].language }}
                </span>
                <span class="ml-2 text-xs text-color-text-soft">
                  {{ i18nLocaleInfo[key].region }}
                </span>
              </div>
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
      <!-- 外链图标 -->
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
</template>

<style lang="scss" scoped>
.el-dropdown {
  color: inherit;
}
</style>
