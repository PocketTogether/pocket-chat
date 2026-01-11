/*
用于初始化 config 集合
如果缺少某个key的记录，就根据默认值补全
*/

/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  // 请注意，在 e.next() 调用之前尝试访问数据库将导致错误。
  e.next()

  // pocketbase 集合 config 默认值
  const pbCollectionConfigDefault = {
    /*
      【pbCollectionConfigDefault_public START】
      此内容在前后端一致
      - vue3\src\config\pb-collection-config.ts
      - pocketbase\pb_hooks\init-config.pb.js
    */
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
    'external-links-to-social-media-icons-etc': [
      {
        icon: 'ri-github-line',
        link: 'https://github.com/PocketTogether/pocket-chat',
        name: 'github',
      },
      {
        icon: 'ri-discord-line',
        link: 'https://discord.gg/aZq6u3Asak',
        name: 'discord',
      },
      {
        icon: 'ri-telegram-2-line',
        link: 'https://t.me/PocketTogether',
        name: 'telegram'
      },
    ],
    /** 
     * 网站名称 
     * 此值特殊，在前端为空字符串，在后端为'PocketChat' 
     */
    'website-name': 'PocketChat',
  }

  // 确保 config 集合存在
  try {
    $app.findCollectionByNameOrId("config")

    // 遍历默认值对象
    /** @type {(keyof typeof pbCollectionConfigDefault)[]} */
    // @ts-ignore
    const configColectionKeys = Object.keys(pbCollectionConfigDefault);
    configColectionKeys.forEach(
      (key) => {
        try {
          // 查找，查不到会抛出错误
          $app.findFirstRecordByData("config", "key", key)
        } catch (error) {
          try {
            // 未找到，创建
            const collection = $app.findCollectionByNameOrId("config")
            const record = new Record(collection)
            record.set('key', key)
            record.set('value', pbCollectionConfigDefault[key])
            $app.save(record);
          } catch (error) {
            console.log(`config 集合 ${key} 初始化失败`)
          }
        }
      })
  } catch (error) {
    // console.log('config 集合不存在')
  }

})
