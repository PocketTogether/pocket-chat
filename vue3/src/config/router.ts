import type { I18nMessagesKeyType } from '@/config'

interface RouterItem {
  path: string
  name: string
  paramsKey?: Record<string, string>
}

// 路由信息字典，导出以便整个程序中使用
export const routerDict = {
  ChatHome: {
    path: '/',
    // name: 'HomePage',
    name: 'ChatHome',
  },
  ChatSetting: {
    path: '/setting',
    name: 'SettingPage',
  },
  LayoutSimple: {
    path: '/LayoutSimple',
    name: 'LayoutSimple',
  },
  LoginPage: {
    path: '/login',
    name: 'LoginPage',
  },
} as const satisfies Record<string, RouterItem>

// // 路由信息字典，导出以便整个程序中使用
// export const routerDict = {
//   LayoutNav: {
//     path: '/LayoutNav',
//     name: 'LayoutNav',
//   },
//   HomePage: {
//     path: '/',
//     name: 'HomePage',
//   },
//   ChatPage: {
//     path: '/chat',
//     name: 'ChatPage',
//   },
//   /**
//    * ChatPageMobile 用于移动端，无导航栏
//    *
//    * 桌面端：
//    * - ChatPage 聊天列 用户列表列
//    *
//    * 移动端：
//    * - ChatPage 用户列表列（包含ChatPageMobile入口）
//    * - ChatPageMobile 聊天列
//    */
//   ChatPageMobile: {
//     path: '/chat-mobile',
//     name: 'ChatPageMobile',
//   },
//   FilePage: {
//     path: '/file',
//     name: 'FilePage',
//   },
//   // 图片页
//   ImagePage: {
//     path: '/image',
//     name: 'ImagePage',
//   },
//   SettingPage: {
//     path: '/setting',
//     name: 'SettingPage',
//   },
//   SettingProfile: {
//     path: '/setting/profile',
//     name: 'SettingProfile',
//   },
//   NavPage: {
//     path: '/nav',
//     name: 'NavPage',
//   },
//   LayoutSimple: {
//     path: '/LayoutSimple',
//     name: 'LayoutSimple',
//   },
//   LoginPage: {
//     path: '/login',
//     name: 'LoginPage',
//   },
//   /**
//    * 房间页
//    *
//    * 路由参数解释
//    * ```
//    * title对逻辑没有影响，房间页是靠id决定房间
//    * 如 http://sakiko.top/前桥魔女/room/pk6fqr5x9o2npb4
//    * title的作用为增强链接的可读性，放在靠前的位置不容易被省略
//    * 推特的推文链接也是类似这样的，第一个链接路径是用户名，即使修改也不会影响帖子加载
//    * 如 https://x.com/harukiO_0/status/1967188571434996220
//    * ```
//    */
//   RoomPage: (() => {
//     const paramsKey = {
//       title: 'title',
//       id: 'id',
//     } as const
//     return {
//       // 使用paramsKey拼接参数字符串，安心安全安定
//       path: `/:${paramsKey.title}/room/:${paramsKey.id}`,
//       name: 'RoomPage',
//       paramsKey,
//     } as const
//   })(),
//   /** 房间详情页 */
//   RoomInfoPage: (() => {
//     const paramsKey = {
//       title: 'title',
//       id: 'id',
//     } as const
//     return {
//       // 使用paramsKey拼接参数字符串，安心安全安定
//       path: `/:${paramsKey.title}/room/:${paramsKey.id}/info`,
//       name: 'RoomInfoPage',
//       paramsKey,
//     } as const
//   })(),
//   CreateRoomPage: {
//     path: '/room/create',
//     name: 'CreateRoomPage',
//   },
//   // RoomDetailPage: {
//   //   path: '/room/:id',
//   //   name: 'RoomDetailPage',
//   // },
//   CreateRoomOK: (() => {
//     const paramsKey = {
//       title: 'title',
//       id: 'id',
//     } as const
//     return {
//       // 使用paramsKey拼接参数字符串，安心安全安定
//       path: `/room/create/ok/:${paramsKey.id}/:${paramsKey.title}`,
//       name: 'CreateRoomOK',
//       paramsKey,
//     } as const
//   })(),
// } as const satisfies Record<string, RouterItem>

interface RouterInfo extends RouterItem {
  titleI18nMessageKey: I18nMessagesKeyType
}

// // 显示在LayoutNav的路由
// export const routerNavInfo = {
//   navList: [
//     {
//       ...routerDict.HomePage,
//       titleI18nMessageKey: 'pageHome',
//       icon: markRaw(RiHomeFill),
//     },
//     {
//       ...routerDict.ChatPage,
//       titleI18nMessageKey: 'pageChat',
//       icon: markRaw(RiMessage3Fill),
//     },
//     // {
//     //   ...routerDict.FilePage,
//     //   titleI18nMessageKey: 'pageFile',
//     //   icon: markRaw(RiFolderFill),
//     // },
//     {
//       ...routerDict.ImagePage,
//       titleI18nMessageKey: 'pageImage',
//       icon: markRaw(RiImageFill),
//     },
//     {
//       ...routerDict.SettingPage,
//       titleI18nMessageKey: 'pageSetting',
//       icon: markRaw(RiSettingsFill),
//     },
//   ],
//   navPage: {
//     ...routerDict.NavPage,
//     titleI18nMessageKey: 'pageNav',
//   },
// } as const satisfies {
//   navList: (RouterInfo & {
//     icon: Component
//   })[]
//   navPage: RouterInfo
// }

// // 显示在设置页的路由
// export const routerSettingList = [
//   {
//     ...routerDict.SettingProfile,
//     titleI18nMessageKey: 'pageSettingProfile',
//     icon: markRaw(RiUserLine),
//   },
// ] as const satisfies (RouterInfo & {
//   icon: Component
// })[]
