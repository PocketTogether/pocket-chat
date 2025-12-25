import { Collections, pb } from '@/lib'
import { imagesBaseExpand, type ImagesResponseWithBaseExpand } from './base'
import { fetchWithTimeoutPreferred } from '@/utils'

/** images 集合 getone */
export const pbImagesGetOneApi = async (imageId: string) => {
  const pbRes = await pb
    .collection(Collections.Images)
    .getOne<ImagesResponseWithBaseExpand>(imageId, {
      expand: imagesBaseExpand,
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })

  return pbRes
}
