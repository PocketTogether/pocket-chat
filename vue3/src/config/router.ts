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
  ImageSelectPage: {
    path: '/image-select',
    name: 'ImageSelectPage',
  },
  ImageInfoPage: (() => {
    const paramsKey = {
      id: 'id',
    } as const
    return {
      // 使用paramsKey拼接参数字符串，安心安全安定
      path: `/image-info/:${paramsKey.id}`,
      name: 'ImageInfoPage',
      // 导出paramsKey以便页面中使用
      paramsKey,
    } as const
  })(),
  FileSelectPage: {
    path: '/file-select',
    name: 'FileSelectPage',
  },
  FileInfoPage: (() => {
    const paramsKey = {
      id: 'id',
    } as const
    return {
      // 使用paramsKey拼接参数字符串，安心安全安定
      path: `/file-info/:${paramsKey.id}`,
      name: 'FileInfoPage',
      // 导出paramsKey以便页面中使用
      paramsKey,
    } as const
  })(),
} as const satisfies Record<string, RouterItem>
