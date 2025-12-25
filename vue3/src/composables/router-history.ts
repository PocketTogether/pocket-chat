import type { ImagesResponseWithBaseExpand } from '@/api'
import { routerDict } from '@/config'
import type { useImagesGetOneQuery } from '@/queries'
import { queryKeys } from '@/queries'
import { useRouterHistoryStore } from '@/stores'
import { useQueryClient } from '@tanstack/vue-query'
import { useRouter, type RouteLocationRaw } from 'vue-router'

/**
 * 一些关于路由的工具
 *
 * 包括页面跳转、页面安全返回
 */
export const useRouterHistoryTool = () => {
  const routerHistoryStore = useRouterHistoryStore()
  const router = useRouter()

  /** 如果可以后退且来源是本站，则后退；否则跳转至指定页面 */
  const routerBackSafe = (data: {
    /** 失败时跳转到的页面，类型和router.push的参数一样，默认为 '/' */
    fallbackTo?: RouteLocationRaw
  }) => {
    const { fallbackTo = '/' } = data

    // 为null即代表当前app中没有上一页
    if (routerHistoryStore.currentPreviousRouterHistoryEntry == null) {
      router.push(fallbackTo)
      return
    }
    router.back()
  }

  const queryClient = useQueryClient()

  /**
   * 跳转至图片详情页的方法，为方便使用封装至此
   */
  const routerGoImageInfoPage = (data: {
    imageId: string
    // 在跳转前预设置查询数据，这样跳转后就立即有数据
    presetImageGetOneData?: ImagesResponseWithBaseExpand
  }) => {
    const {
      //
      imageId,
      presetImageGetOneData,
    } = data

    // ImagesGetOneQuery 的数据类型
    type ImagesGetOneQueryDataValueType = ReturnType<
      typeof useImagesGetOneQuery
    >['data']['value']

    // 对 useImagesGetOneQuery
    // 在跳转前预设置查询数据，这样跳转后就立即有数据
    if (presetImageGetOneData != null) {
      // 立即执行的箭头函数，主要为了其中可以使用return以方便逻辑检查
      ;(() => {
        // getQueryData 原本返回类型为 unknown，这里 as 为应为的值
        // try 以避免访问 getQueryData 获取的值时出错，如 TypeError: Cannot read properties of undefined
        try {
          const imageGetOneQueryKey = queryKeys.imagesGetOne(imageId)

          // 先检查是否已有缓存
          const cached = queryClient.getQueryData(imageGetOneQueryKey) as
            | ImagesGetOneQueryDataValueType
            | undefined

          // 有缓存，且日期新，则不应再设置查询数据了
          if (
            cached != null &&
            cached.updated >= presetImageGetOneData.updated
          ) {
            return
          }

          // 预设置查询数据
          queryClient.setQueryData(
            imageGetOneQueryKey,
            // 确保类型正确
            presetImageGetOneData satisfies ImagesGetOneQueryDataValueType
          )
        } catch (error) {
          console.warn(
            'useRouterHistoryTool',
            'routerGoImageInfoPage',
            'presetImageGetOneData',
            'queryClient.getQueryData',
            error
          )
        }
      })()
    }

    router.push({
      name: routerDict.ImageInfoPage.name,
      params: {
        [routerDict.ImageInfoPage.paramsKey.id]: imageId,
      },
    })
  }

  return {
    routerBackSafe,
    routerGoImageInfoPage,
  }
}
