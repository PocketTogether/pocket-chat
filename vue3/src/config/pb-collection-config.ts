import { z } from 'zod'

// pocketbase 集合 config 其值的 zodSchema
export const pbCollectionConfigSchema = {
  'allow-users-to-register': z.boolean(),
  'allow-anonymous-view': z.boolean(),
  'email-update-rate-limit-second': z.number(),
  'email-verify-rate-limit-second': z.number(),
  'password-update-rate-limit-second': z.number(),
  'website-name': z.string(),
  'external-links-to-social-media-icons-etc': z.array(
    z.object({
      icon: z.string(),
      link: z.string(),
      name: z.string(),
    })
  ),
}
// 类型体操：自动推导出类型结构
export type PbCollectionConfigType = {
  [K in keyof typeof pbCollectionConfigSchema]: z.infer<
    (typeof pbCollectionConfigSchema)[K]
  >
}

// pocketbase 集合 config 默认值
// export const pbCollectionConfigDefault: PbCollectionConfigType = { /* ... */ }
/**
 * pocketbase 集合 config 默认值获取函数
 * - 使用函数返回默认数据以避免忘记深拷贝
 */
export const pbCollectionConfigDefaultGetFn = () => {
  return {
    /*
      【pbCollectionConfigDefault_public START】
      此内容在前后端一致
      - vue3\src\config\pb-collection-config.ts
      - pocketbase\pb_hooks\init-config.pb.js
    */
    /** 是否允许用户注册 */
    'allow-users-to-register': true,
    /** 是否允许任何人查看，不登录也能查看（游客访问） */
    'allow-anonymous-view': true,
    /** 邮箱修改最短秒数（由 客户端/前端 实现的速率限制，单位秒） */
    'email-update-rate-limit-second': 30,
    /** 邮箱验证最短秒数 */
    'email-verify-rate-limit-second': 30,
    /** 密码修改最短秒数 */
    'password-update-rate-limit-second': 30,
    /*
      【pbCollectionConfigDefault_public END】
    */

    /**
     * 网站名称
     * 此值特殊，在前端为空字符串，在后端为'PocketTogether'
     */
    'website-name': '',
    /**
     * 社交媒体等图标外链（显示在登录页底部的图标链接） https://remixicon.com/
     * 此值特殊，在前端为空数组，在后端为
     * [
     *   {
     *     icon: 'ri-github-line',
     *     link: 'https://github.com/haruki1953/pocket-together',
     *     name: 'github',
     *   },
     *   {
     *     icon: 'ri-discord-line',
     *     link: 'https://discord.gg/aZq6u3Asak',
     *     name: 'discord',
     *   },
     * ],
     */
    'external-links-to-social-media-icons-etc': [],
  } satisfies PbCollectionConfigType as PbCollectionConfigType
}
