import { z } from 'zod'

const uploadImageProcessOptionsConfigSchema = z.object({
  sumWidthHeightLimit: z.number(),
  format: z.enum(['image/png', 'image/jpeg', 'image/webp']),
  quality: z.number().min(0).max(1),
})

// pocketbase 集合 config 其值的 zodSchema
export const pbCollectionConfigSchema = {
  'user-max-upload-file-size-default': z.number().int().gt(0), // 为正整数，大于0的整数
  'user-can-upload-file-default': z.boolean(),
  'user-can-upload-image-default': z.boolean(),
  'user-can-send-message-default': z.boolean(),
  'user-register-oauth2-only': z.boolean(),
  'allow-users-to-register': z.boolean(),
  'allow-anonymous-view': z.boolean(),
  'email-update-rate-limit-second': z.number(),
  'email-verify-rate-limit-second': z.number(),
  'password-update-rate-limit-second': z.number(),
  'upload-image-process-options': z.object({
    imageConfig: uploadImageProcessOptionsConfigSchema,
    bigConfig: uploadImageProcessOptionsConfigSchema,
    smallConfig: uploadImageProcessOptionsConfigSchema,
    tinyConfig: uploadImageProcessOptionsConfigSchema,
  }),
  'admin-contact-info-for-permission': z.string(),
  'external-links-to-social-media-icons-etc': z.array(
    z.object({
      icon: z.string(),
      link: z.string(),
      name: z.string(),
    })
  ),
  'website-name': z.string(),
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
    /** 默认允许上传文件的最大大小（字节数），为正整数，大于0的整数，默认20MB */
    'user-max-upload-file-size-default': 20 * 1024 * 1024, //
    /** 是否默认允许上传文件 */
    'user-can-upload-file-default': true,
    /** 是否默认允许上传图片 */
    'user-can-upload-image-default': true,
    /** 是否默认允许发送消息 */
    'user-can-send-message-default': true,
    /** 是否只允许oauth2注册 */
    'user-register-oauth2-only': false,
    /** 是否允许用户注册 */
    'allow-users-to-register': true,
    /** 是否允许任何人查看，不登录也能查看（游客访问） */
    'allow-anonymous-view': true,
    /** 邮箱修改最短秒数（由 客户端/前端 实现的速率限制，单位秒） */
    'email-update-rate-limit-second': 60,
    /** 邮箱验证最短秒数 */
    'email-verify-rate-limit-second': 60,
    /** 密码修改最短秒数 */
    'password-update-rate-limit-second': 60,
    /**
     * 图片的处理配置，
     * 建议为 image/webp ，这样体积小，还不会丢失透明通道
     */
    'upload-image-process-options': {
      imageConfig: {
        sumWidthHeightLimit: 2000,
        format: 'image/webp',
        quality: 0.8,
      },
      bigConfig: {
        sumWidthHeightLimit: 4000,
        format: 'image/webp',
        quality: 0.9,
      },
      smallConfig: {
        sumWidthHeightLimit: 1200,
        format: 'image/webp',
        quality: 0.8,
      },
      tinyConfig: {
        sumWidthHeightLimit: 800,
        format: 'image/webp',
        quality: 0.8,
      },
    },
    /*
      【pbCollectionConfigDefault_public END】
    */

    // 有关自部署自定义内容（名称、联系方式）相关信息的，前后端会略有区别
    /**
     * 管理员联系方式，主要用于用户权限不足时，提示给用户的联系方式，前后端默认值都为空字符串
     */
    'admin-contact-info-for-permission': '',
    /**
     * 社交媒体等图标外链（显示在登录页底部的图标链接） https://remixicon.com/
     * 此值特殊，在前端为空数组，在后端为默认图标数组
     */
    'external-links-to-social-media-icons-etc': [],
    /**
     * 网站名称
     * 此值特殊，在前端为空字符串，在后端为'PocketChat'
     */
    'website-name': '',
  } satisfies PbCollectionConfigType as PbCollectionConfigType
}
