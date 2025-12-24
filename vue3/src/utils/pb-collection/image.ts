import type { ImagesResponseWithBaseExpand } from '@/api'
import { pb } from '@/lib'

// 根据目标大小，从图片数据中挑选
export const pbImageDataChooseByTargetSize = (
  imageData: ImagesResponseWithBaseExpand,
  data: {
    targetWidth: number
    targetHeight: number
  }
) => {
  const { targetWidth, targetHeight } = data

  // Tiny
  if (
    imageData.imageTiny !== '' &&
    imageData.imageTinyWidth >= targetWidth &&
    imageData.imageTinyHeight >= targetHeight
  ) {
    return {
      image: imageData.imageTiny,
      width: imageData.imageTinyWidth,
      height: imageData.imageTinyHeight,
    }
  }

  // Small
  if (
    imageData.imageSmall !== '' &&
    imageData.imageSmallWidth >= targetWidth &&
    imageData.imageSmallHeight >= targetHeight
  ) {
    return {
      image: imageData.imageSmall,
      width: imageData.imageSmallWidth,
      height: imageData.imageSmallHeight,
    }
  }

  // Normal image
  if (
    imageData.image !== '' &&
    imageData.imageWidth >= targetWidth &&
    imageData.imageHeight >= targetHeight
  ) {
    return {
      image: imageData.image,
      width: imageData.imageWidth,
      height: imageData.imageHeight,
    }
  }

  // Big
  if (
    imageData.imageBig !== '' &&
    imageData.imageBigWidth >= targetWidth &&
    imageData.imageBigHeight >= targetHeight
  ) {
    return {
      image: imageData.imageBig,
      width: imageData.imageBigWidth,
      height: imageData.imageBigHeight,
    }
  }

  // 兜底：返回 image
  return {
    image: imageData.image,
    width: imageData.imageWidth,
    height: imageData.imageHeight,
  }
}
// 根据目标大小，从图片数据中挑选，并得到其URL
export const pbImageDataChooseByTargetSizeWithUrl = (
  imageData: ImagesResponseWithBaseExpand,
  data: {
    targetWidth: number
    targetHeight: number
  }
) => {
  //
  const chooseData = pbImageDataChooseByTargetSize(imageData, data)
  return {
    url: pb.files.getURL(imageData, chooseData.image),
    ...chooseData,
  }
}

// 挑选最大的
export const pbImageDataChooseByLargest = (
  imageData: ImagesResponseWithBaseExpand
) => {
  // Big
  if (
    imageData.imageBig !== '' &&
    imageData.imageBigWidth > 0 &&
    imageData.imageBigHeight > 0
  ) {
    return {
      image: imageData.imageBig,
      width: imageData.imageBigWidth,
      height: imageData.imageBigHeight,
    }
  }

  // 兜底：返回 image
  return {
    image: imageData.image,
    width: imageData.imageWidth,
    height: imageData.imageHeight,
  }
}
export const pbImageDataChooseByLargestWithUrl = (
  imageData: ImagesResponseWithBaseExpand
) => {
  const chooseData = pbImageDataChooseByLargest(imageData)
  return {
    url: pb.files.getURL(imageData, chooseData.image),
    ...chooseData,
  }
}

// 挑选最小的
export const pbImageDataChooseBySmallest = (
  imageData: ImagesResponseWithBaseExpand
) => {
  if (
    imageData.imageTiny !== '' &&
    imageData.imageTinyWidth > 0 &&
    imageData.imageTinyHeight > 0
  ) {
    return {
      image: imageData.imageTiny,
      width: imageData.imageTinyWidth,
      height: imageData.imageTinyHeight,
    }
  }

  if (
    imageData.imageSmall !== '' &&
    imageData.imageSmallWidth > 0 &&
    imageData.imageSmallHeight > 0
  ) {
    return {
      image: imageData.imageSmall,
      width: imageData.imageSmallWidth,
      height: imageData.imageSmallHeight,
    }
  }

  // 兜底：返回 image
  return {
    image: imageData.image,
    width: imageData.imageWidth,
    height: imageData.imageHeight,
  }
}
export const pbImageDataChooseBySmallestWithUrl = (
  imageData: ImagesResponseWithBaseExpand
) => {
  const chooseData = pbImageDataChooseBySmallest(imageData)
  return {
    url: pb.files.getURL(imageData, chooseData.image),
    ...chooseData,
  }
}
