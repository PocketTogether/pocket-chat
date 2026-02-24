import type {
  FilesResponseWithBaseExpand,
  ImagesResponseWithBaseExpand,
  UsersResponseWithBaseExpand,
} from '@/api'
import { routerDict } from '@/config'
import type {
  useFilesGetOneQuery,
  useImagesGetOneQuery,
  useUsersGetOneQuery,
} from '@/queries'
import { queryKeys } from '@/queries'
import { useRouterHistoryStore } from '@/stores'
import { useQueryClient } from '@tanstack/vue-query'
import { throttle } from 'lodash-es'
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

  // // 帮我写一个新方法 routerBackSafeWithThrottleToAntiCombo
  // // 目的是达到防连击的效果，建议使用 lodash-es
  // // 其中会调用 routerBackSafe
  // // 要有注释、要有jsdoc
  // const routerBackSafeWithThrottleToAntiCombo = (data: {
  //   /** 失败时跳转到的页面，类型和router.push的参数一样，默认为 '/' */
  //   fallbackTo?: RouteLocationRaw
  // }) => {
  //   const { fallbackTo = '/' } = data
  //   //
  // }

  /**
   * 防连击版本的 routerBackSafe ，建议都用这个
   *
   * - 使用 throttle 限制在一定时间内只能触发一次
   * - 避免用户连续点击导致重复跳转
   * - 内部仍然调用 routerBackSafe，保持逻辑一致
   *
   * @param data 与 routerBackSafe 相同的参数
   */
  const routerBackSafeWithThrottleToAntiCombo = throttle(
    routerBackSafe,
    2000, // 这么多毫秒内只允许触发一次，可根据需要调整
    {
      leading: true, // 第一次立即触发
      trailing: false, // 禁止尾部触发，避免“延迟执行”导致体验怪异
    }
  )

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

  /**
   * 跳转至文件详情页的方法，为方便使用封装至此
   */
  const routerGoFileInfoPage = (data: {
    fileId: string
    // 在跳转前预设置查询数据，这样跳转后就立即有数据
    presetFileGetOneData?: FilesResponseWithBaseExpand
  }) => {
    const {
      //
      fileId,
      presetFileGetOneData,
    } = data

    // FilesGetOneQuery 的数据类型
    type FilesGetOneQueryDataValueType = ReturnType<
      typeof useFilesGetOneQuery
    >['data']['value']

    // 对 useFilesGetOneQuery
    // 在跳转前预设置查询数据，这样跳转后就立即有数据
    if (presetFileGetOneData != null) {
      // 立即执行的箭头函数，主要为了其中可以使用return以方便逻辑检查
      ;(() => {
        // getQueryData 原本返回类型为 unknown，这里 as 为应为的值
        // try 以避免访问 getQueryData 获取的值时出错，如 TypeError: Cannot read properties of undefined
        try {
          const fileGetOneQueryKey = queryKeys.filesGetOne(fileId)

          // 先检查是否已有缓存
          const cached = queryClient.getQueryData(fileGetOneQueryKey) as
            | FilesGetOneQueryDataValueType
            | undefined

          // 有缓存，且日期新，则不应再设置查询数据了
          if (
            cached != null &&
            cached.updated >= presetFileGetOneData.updated
          ) {
            return
          }

          // 预设置查询数据
          queryClient.setQueryData(
            fileGetOneQueryKey,
            // 确保类型正确
            presetFileGetOneData satisfies FilesGetOneQueryDataValueType
          )
        } catch (error) {
          console.warn(
            'useRouterHistoryTool',
            'routerGoFileInfoPage',
            'presetFileGetOneData',
            'queryClient.getQueryData',
            error
          )
        }
      })()
    }

    router.push({
      name: routerDict.FileInfoPage.name,
      params: {
        [routerDict.FileInfoPage.paramsKey.id]: fileId,
      },
    })
  }

  /**
   * 跳转至用户详情页的方法，为方便使用封装至此
   */
  const routerGoUserInfoPage = (data: {
    userId: string
    // 在跳转前预设置查询数据，这样跳转后就立即有数据
    presetUserGetOneData?: UsersResponseWithBaseExpand
  }) => {
    const {
      //
      userId,
      presetUserGetOneData,
    } = data

    // UsersGetOneQuery 的数据类型
    type UsersGetOneQueryDataValueType = ReturnType<
      typeof useUsersGetOneQuery
    >['data']['value']

    // 对 useUsersGetOneQuery
    // 在跳转前预设置查询数据，这样跳转后就立即有数据
    if (presetUserGetOneData != null) {
      // 立即执行的箭头函数，主要为了其中可以使用return以方便逻辑检查
      ;(() => {
        // getQueryData 原本返回类型为 unknown，这里 as 为应为的值
        // try 以避免访问 getQueryData 获取的值时出错，如 TypeError: Cannot read properties of undefined
        try {
          const userGetOneQueryKey = queryKeys.usersGetOne(userId)

          // 先检查是否已有缓存
          const cached = queryClient.getQueryData(userGetOneQueryKey) as
            | UsersGetOneQueryDataValueType
            | undefined

          // 有缓存，且日期新，则不应再设置查询数据了
          if (
            cached != null &&
            cached.updated >= presetUserGetOneData.updated
          ) {
            return
          }

          // 预设置查询数据
          queryClient.setQueryData(
            userGetOneQueryKey,
            // 确保类型正确
            presetUserGetOneData satisfies UsersGetOneQueryDataValueType
          )
        } catch (error) {
          console.warn(
            'useRouterHistoryTool',
            'routerGoUserInfoPage',
            'presetUserGetOneData',
            'queryClient.getQueryData',
            error
          )
        }
      })()
    }

    router.push({
      name: routerDict.UserInfoPage.name,
      params: {
        [routerDict.UserInfoPage.paramsKey.id]: userId,
      },
    })
  }

  return {
    routerBackSafe,
    routerBackSafeWithThrottleToAntiCombo,
    routerGoImageInfoPage,
    routerGoFileInfoPage,
    routerGoUserInfoPage,
  }
}
