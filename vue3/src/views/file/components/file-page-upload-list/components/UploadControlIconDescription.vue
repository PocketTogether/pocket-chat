<script setup lang="ts">
import { useI18nStore } from '@/stores'
import type { IconDescriptionKeyType } from './dependencies'

const props = defineProps<{
  iconDescriptionKey: IconDescriptionKeyType | null
}>()

const i18nStore = useI18nStore()
</script>

<template>
  <div>
    <Transition name="fade" mode="out-in">
      <div
        v-if="iconDescriptionKey === 'clearFinished'"
        class="flex items-center"
      >
        <div class="mr-[4px]">
          <div class="flow-root">
            <div class="m-[4px] text-color-text-soft">
              <RiDeleteBin7Line size="20px"></RiDeleteBin7Line>
            </div>
          </div>
        </div>
        <div
          class="select-none truncate pr-1 text-[14px] font-bold italic text-color-text-soft"
        >
          {{ i18nStore.t('uploadControlClearFinishedText')() }}
        </div>
      </div>
      <div
        v-else-if="iconDescriptionKey === 'clearErrorOrInterrupted'"
        class="flex items-center"
      >
        <div class="mr-[4px]">
          <div class="flow-root">
            <div class="m-[4px] text-color-text-soft">
              <RiDeleteBin2Line size="20px"></RiDeleteBin2Line>
            </div>
          </div>
        </div>
        <div
          class="select-none truncate pr-1 text-[14px] font-bold italic text-color-text-soft"
        >
          {{ i18nStore.t('uploadControlClearErrorOrInterruptedText')() }}
        </div>
      </div>
      <div
        v-else-if="iconDescriptionKey === 'clearAborted'"
        class="flex items-center"
      >
        <div class="mr-[4px]">
          <div class="flow-root">
            <div class="m-[4px] text-color-text-soft">
              <RiDeleteBinLine size="20px"></RiDeleteBinLine>
            </div>
          </div>
        </div>
        <div
          class="select-none truncate pr-1 text-[14px] font-bold italic text-color-text-soft"
        >
          {{ i18nStore.t('uploadControlClearAbortedText')() }}
        </div>
      </div>
      <div
        v-else-if="iconDescriptionKey === 'abortAll'"
        class="flex items-center"
      >
        <div class="mr-[4px]">
          <div class="flow-root">
            <div class="m-[4px] text-color-text-soft">
              <RiStopFill size="20px"></RiStopFill>
            </div>
          </div>
        </div>
        <div
          class="select-none truncate pr-1 text-[14px] font-bold italic text-color-text-soft"
        >
          {{ i18nStore.t('uploadControlAbortAllText')() }}
        </div>
      </div>
      <div
        v-else-if="iconDescriptionKey === 'abortPending'"
        class="flex items-center"
      >
        <div class="mr-[4px]">
          <div class="flow-root">
            <div class="m-[4px] text-color-text-soft">
              <RiStopCircleLine size="20px"></RiStopCircleLine>
            </div>
          </div>
        </div>
        <div
          class="select-none truncate pr-1 text-[14px] font-bold italic text-color-text-soft"
        >
          {{ i18nStore.t('uploadControlAbortPendingText')() }}
        </div>
      </div>
      <div
        v-else-if="iconDescriptionKey === 'abortUploading'"
        class="flex items-center"
      >
        <div class="mr-[4px]">
          <div class="flow-root">
            <div class="m-[4px] text-color-text-soft">
              <RiStopCircleLine size="20px"></RiStopCircleLine>
            </div>
          </div>
        </div>
        <div
          class="select-none truncate pr-1 text-[14px] font-bold italic text-color-text-soft"
        >
          {{ i18nStore.t('uploadControlAbortUploadingText')() }}
        </div>
      </div>
      <div
        v-else-if="iconDescriptionKey === 'retryUpload'"
        class="flex items-center"
      >
        <div class="mr-[4px]">
          <div class="flow-root">
            <div class="m-[4px] text-color-text-soft">
              <RiArrowUpCircleLine size="20px"></RiArrowUpCircleLine>
            </div>
          </div>
        </div>
        <div
          class="select-none truncate pr-1 text-[14px] font-bold italic text-color-text-soft"
        >
          {{ i18nStore.t('uploadControlRetryUploadText')() }}
        </div>
      </div>
      <div
        v-else-if="iconDescriptionKey === 'deleteUpload'"
        class="flex items-center"
      >
        <div class="mr-[4px]">
          <div class="flow-root">
            <div class="m-[4px] text-color-text-soft">
              <RiCloseCircleLine size="20px"></RiCloseCircleLine>
            </div>
          </div>
        </div>
        <div
          class="select-none truncate pr-1 text-[14px] font-bold italic text-color-text-soft"
        >
          {{ i18nStore.t('uploadControlDeleteUploadText')() }}
        </div>
      </div>
      <template v-else>
        <slot></slot>
      </template>
    </Transition>
  </div>
</template>

<style lang="scss" scoped></style>
