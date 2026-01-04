import { imageGetDprFn } from '@/config'
import type {
  RefViewerImageType,
  ViewerDisplayDesuwaType,
  ViewerPropsType,
} from './dependencise'
import { useWindowSize } from '@vueuse/core'
import {
  pbImageDataChooseByLargest,
  pbImageDataChooseByLargestWithUrl,
} from '@/utils'
import { v4 as uuidv4 } from 'uuid'

export const useViewerControlDesuwa = (data: {
  //
  props: ViewerPropsType
  viewerDisplayDesuwa: ViewerDisplayDesuwaType
  refViewerImage: RefViewerImageType
}) => {
  const {
    //
    props,
    viewerDisplayDesuwa,
    refViewerImage,
  } = data

  const {
    isAltOpen,
    viewerKeyUuid,
    // viewerImageList,
    viewerImageCurrentId,
    // viewerImageData,
    // imageSizeAndUrl,
    // viewerContentSize,
    // viewerContentData,
    // viewerAllSize,
  } = viewerDisplayDesuwa

  // 展开alt
  const altOpen = () => {
    isAltOpen.value = true
  }
  const altClose = () => {
    isAltOpen.value = false
  }

  const controlReset = () => {
    isAltOpen.value = false
  }

  watch(
    () => props.dialogVisible,
    (val) => {
      if (val === true) {
        // 每次打开时reset
        controlReset()
        viewerImageCurrentId.value = props.imageCurrentId
        viewerKeyUuid.value = uuidv4()
      }
    },
    { immediate: true }
  )

  watch(
    () => props.imageCurrentId,
    (val) => {
      viewerImageCurrentId.value = val
    },
    { immediate: true }
  )

  // 切换显示图片
  const viewerImageSwitch = (imageId: string) => {
    controlReset()
    if (viewerImageCurrentId.value === imageId) {
      refViewerImage.value?.reset()
    }
    viewerImageCurrentId.value = imageId
  }

  const viewerClose = () => {
    props.dialogCloseFn()
  }

  return {
    altOpen,
    altClose,
    controlReset,
    viewerImageSwitch,
    viewerClose,
  }
}

export type ViewerControlDesuwaType = ReturnType<typeof useViewerControlDesuwa>
