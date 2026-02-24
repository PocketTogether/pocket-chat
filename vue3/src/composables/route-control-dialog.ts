import { useRoute, useRouter } from 'vue-router'
import { useRouterHistoryTool } from '@/composables'
import { routerDict } from '@/config'

/**
 * 通过route控制dialog，根据路由query参数决定是否显示对话框，router.push即打开对话框，back即关闭（开关前应判断当前是否为打开）。
 * 透过router.push控制对话框的优点是，当用户按浏览器返回按钮或手机返回键时，可以控制对话关闭
 */
export const useRouteControlDialog = (data: {
  /** 控制dialog是否显示的query键, 不同的对话框应使用不同的，且要避免与其他query参数冲突 */
  dialogQueryKey: string
}) => {
  const { dialogQueryKey } = data

  const route = useRoute()
  const router = useRouter()
  const { routerBackSafeWithThrottleToAntiCombo } = useRouterHistoryTool()

  const dialogVisible = computed(() => {
    if (route.query[dialogQueryKey] != null) {
      return true
    }
    return false
  })

  const dialogOpen = () => {
    // 当前已打开则直接返回
    if (dialogVisible.value === true) {
      return
    }
    // router.push即打开对话框
    router.push({
      path: route.path,
      query: {
        // 保留已有的query参数
        ...route.query,
        [dialogQueryKey]: '',
      },
    })
  }
  const dialogClose = () => {
    // 当前已关闭则直接返回
    if (dialogVisible.value === false) {
      return
    }
    routerBackSafeWithThrottleToAntiCombo({
      fallbackTo: {
        path: route.path,
        query: {
          ...route.query,
          [dialogQueryKey]: undefined,
        },
      },
    })
  }

  return {
    dialogVisible,
    dialogOpen,
    dialogClose,
  }
}
