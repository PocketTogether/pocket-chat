import { onMounted } from 'vue'
import { pb } from '@/lib'
import { useAuthStore } from '@/stores'
import { useMutation } from '@tanstack/vue-query'
import { queryRetryPbNetworkError, usePbCollectionConfigQuery } from '@/queries'
import { pbUsersAuthRefreshApi } from '@/api'
import { useRouter } from 'vue-router'
import { routerDict } from '@/config'

// 组合式的意义就是封装和复用有状态逻辑
// https://cn.vuejs.org/guide/reusability/composables.html

// 控制首次数据的加载，以及加载动画遮罩的关闭
export const useFirstDataLoadingAndAnimationMaskClose = (data: {
  dataFirstLoadService: () => Promise<void>
}) => {
  const { dataFirstLoadService } = data

  // 等待加载数据，之后取消在 index.html 中的加载遮罩
  onMounted(async () => {
    await dataFirstLoadAwait()
    indexMaskClose()
  })

  // const statesStore = useStatesStore()

  // 等待加载数据，最多等待5秒，最少等待1秒
  const dataFirstLoadAwait = async () => {
    // const maxTimeout = statesStore.isFirstLoadFirstData ? 10000 : 3000
    const maxTimeout = 5000
    const minTimeout = 1000
    await Promise.all([
      Promise.race([
        dataFirstLoadService().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, maxTimeout)),
      ]),
      new Promise((resolve) => setTimeout(resolve, minTimeout)),
    ])
    // 首屏遮罩增加额外300ms等待时间，以等待聊天页的加载图标过渡结束
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  // 关闭加载遮罩，恢复滚动条，同时防止抖动
  // 【251019】不再使用原生滚动条（不再需要担心滚动条宽度引起的抖动）
  const indexMaskClose = async () => {
    // const scrollbarWidth = getScrollbarWidth()
    const maskElement = document.getElementById('index-mask')
    // document.documentElement.style.overflowY = ''
    if (maskElement) {
      // maskElement.style.right = `-${scrollbarWidth}px`
      maskElement.style.opacity = '0'
      await new Promise((resolve) => setTimeout(resolve, 300))
      maskElement.style.display = 'none'
    }
  }
}

// 在程序初始化时，进行关于pocketbase身份验证的一些操作
export const useInitPbAuth = () => {
  const authStore = useAuthStore()
  // 将pb.authStore响应式，onChange时赋值给本地的authStore
  pb.authStore.onChange(
    () => {
      authStore.setAuth(pb.authStore)
    },
    // 立即执行
    true
  )

  // 每次启动时，刷新auth
  const mutation = useMutation({
    mutationFn: async () => {
      // 未登录，返回
      if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
        return
      }

      const pbRes = await pbUsersAuthRefreshApi().catch(() => null)

      return pbRes
    },
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })
  onMounted(async () => {
    await mutation.mutateAsync()
  })
}

/** 监听 是否允许所有人查看 与 响应式的登录状态 的变化，在allowAnonymousView 变为false时，且当前未登录，应跳转至登录页 */
export const useWatchAllowAnonymousViewAndAuthStoreIsValidCheckRouterLoginPage =
  () => {
    const pbCollectionConfigQuery = usePbCollectionConfigQuery()

    // 是否允许所有人查看（游客访问）
    const allowAnonymousView = computed(() => {
      const val = pbCollectionConfigQuery.data.value?.['allow-anonymous-view']
      // val == null 只为了类型确定，理论上此值不会为空，默认为true
      if (val == null) {
        return true
      }
      return val
    })
    // 响应式的登录状态
    const authStore = useAuthStore()

    const router = useRouter()

    // 检查条件，转到登录页
    const checkRouterLoginPage = () => {
      // allowAnonymousView 变为false时，且当前未登录，应跳转至登录页
      if (allowAnonymousView.value === false && authStore.isValid === false) {
        router.push(routerDict.LoginPage.path)
      }
    }
    // 监听 是否允许所有人查看 与 响应式的登录状态 的变化
    watch(allowAnonymousView, checkRouterLoginPage)
    watch(() => authStore.isValid, checkRouterLoginPage)
  }
