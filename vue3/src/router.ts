import { createRouter, createWebHistory } from 'vue-router'
import { pbCollectionConfigDefaultGetFn, routerDict } from './config'

import { ChatHome, ChatSetting, LayoutSimple, LoginPage } from './views'
import {
  useAuthStore,
  usePlaceholderDataPbCollectionConfigStore,
  useRouterHistoryStore,
} from './stores'
import { getAppMainElScrollbarWrap } from './utils'
import { usePbCollectionConfigQuery } from './queries'
import { pb } from './lib'

// 路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      ...routerDict.LayoutSimple,
      component: LayoutSimple,
      redirect: routerDict.ChatHome.path,
      children: [
        {
          ...routerDict.LoginPage,
          component: LoginPage,
        },
        {
          ...routerDict.ChatHome,
          component: ChatHome,
        },
        {
          ...routerDict.ChatSetting,
          component: ChatSetting,
        },
      ],
    },
  ],
  // 路由滚动行为定制
  // scrollBehavior: async (to, from, savedPosition) => {}
})

// 路由访问拦截
router.beforeEach((to, from) => {
  // 登录页统统放行
  if (to.name === routerDict.LoginPage.name) {
    return
  }

  // 【251109】
  // 路由守卫中使用 usePbCollectionConfigQuery（useQuery）是不应该的，
  // 退而求其次使用 usePlaceholderDataPbCollectionConfigStore（之后写为 useP31gStore ）
  // const pbCollectionConfigQuery = usePbCollectionConfigQuery()
  const placeholderDataPbCollectionConfigStore =
    usePlaceholderDataPbCollectionConfigStore()
  // 是否允许所有人查看
  const allowAnonymousView = (() => {
    // const val = pbCollectionConfigQuery.data.value?.['allow-anonymous-view']
    const val = (() => {
      // useP31gStore可能未初始化，此时使用默认值
      if (placeholderDataPbCollectionConfigStore.data == null) {
        return pbCollectionConfigDefaultGetFn()['allow-anonymous-view']
      }
      return placeholderDataPbCollectionConfigStore.data['allow-anonymous-view']
    })()
    // // val == null 只为了类型确定，理论上此值不会为空，默认为true
    // if (val == null) {
    //   return true
    // }
    return val
  })()
  // 如果当前为不允许所有人查看，且当前用户未登录，则拦截到登录页
  if (!allowAnonymousView && !pb.authStore.isValid) {
    return routerDict.LoginPage.path
  }

  // 路由不存在，拦截到首页
  if (router.resolve(to.path).matched.length === 0) {
    return routerDict.ChatHome.path
  }
})

// 新页面回到顶部
router.afterEach((to, from) => {
  // 之所以不用 createRouter 中的 scrollBehavior 来控制，是因为 scrollBehavior 会等到组件onMounted后再进行，会影响聊天页的滚动控制
  // router.afterEach 是在组件setup前进行

  // 路径不变时（query可以改变），不滚动
  if (to.path === from.path) {
    return
  }
  // 回到顶部（不使用页面原生滚动条，使用的是自设的滚动条）
  const appMainElScrollbarWrap = getAppMainElScrollbarWrap()
  appMainElScrollbarWrap?.scrollTo({
    top: 0,
    behavior: 'instant',
  })
})

// 自建路由历史栈
router.afterEach(() => {
  const routerHistoryStore = useRouterHistoryStore()
  routerHistoryStore.routerAfterEachCheckHistoryStateAndControlRouterHistoryStack()
})

// // 测试
// router.beforeEach((to, from) => {
//   console.log('beforeEach')
//   console.log('location.href', location.href)
//   console.log('to.fullPath', to.fullPath)
//   console.log('from.fullPath', from.fullPath)
// })
// router.afterEach((to, from) => {
//   console.log('afterEach')
//   console.log('location.href', location.href)
//   console.log('to.fullPath', to.fullPath)
//   console.log('from.fullPath', from.fullPath)
// })

export default router
