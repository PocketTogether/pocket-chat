import { UsersCanSendMessageOptions, UsersCanUploadImageOptions } from '@/lib'
import { usePbCollectionConfigQuery, useProfileQuery } from '@/queries'
import { useAuthStore, useI18nStore } from '@/stores'
import { potoNotification } from '@/utils'

// 整理用户权限
export const useUserPermissionsDesuwa = () => {
  const pbCollectionConfigQuery = usePbCollectionConfigQuery()
  const profileQuery = useProfileQuery()
  const authStore = useAuthStore()

  // pbCollectionConfigQuery 中的一些值
  /** 是否默认允许上传图片 */
  const configUserCanUploadImageDefault = computed(() => {
    const val =
      pbCollectionConfigQuery.data.value?.['user-can-upload-image-default']
    // val == null 只为了类型确定，理论上此值不会为空，默认为true
    if (val == null) {
      return true
    }
    return val
  })
  /** 是否默认允许发送消息 */
  const configUserCanSendMessageDefault = computed(() => {
    const val =
      pbCollectionConfigQuery.data.value?.['user-can-send-message-default']
    // val == null 只为了类型确定，理论上此值不会为空，默认为true
    if (val == null) {
      return true
    }
    return val
  })

  // 用户信息里的一些值
  const profileCanSendMessage = computed(
    () => profileQuery.data.value?.canSendMessage
  )
  const profileCanUploadImage = computed(
    () => profileQuery.data.value?.canUploadImage
  )

  // 是否有发送消息权限
  const permissionSendMessage = computed(() => {
    // 未登录，返回false
    if (authStore.isValid === false || authStore.record?.id == null) {
      return false
    }
    // profileCanSendMessage 无值说明个人信息请求未完成，为 false
    // 注：profileQuery是有持久化的
    if (profileCanSendMessage.value == null) {
      return false
    }

    // 为YES即为true
    if (profileCanSendMessage.value === UsersCanSendMessageOptions.YES) {
      return true
    }
    // 为NO即为false
    if (profileCanSendMessage.value === UsersCanSendMessageOptions.NO) {
      return false
    }
    // 为空时，根据 configUserCanSendMessageDefault
    // if (profileCanSendMessage.value === UsersCanSendMessageOptions[''])
    return configUserCanSendMessageDefault.value
  })
  // 是否有上传图片权限
  const permissionUploadImage = computed(() => {
    // 未登录，返回false
    if (authStore.isValid === false || authStore.record?.id == null) {
      return false
    }
    // profileCanUploadImage 无值说明个人信息请求未完成，为 false
    // 注：profileQuery是有持久化的
    if (profileCanUploadImage.value == null) {
      return false
    }

    // 为YES即为true
    if (profileCanUploadImage.value === UsersCanUploadImageOptions.YES) {
      return true
    }
    // 为NO即为false
    if (profileCanUploadImage.value === UsersCanUploadImageOptions.NO) {
      return false
    }
    // 为空时，根据 configUserCanUploadImageDefault
    // if (profileCanUploadImage.value === UsersCanUploadImageOptions[''])
    return configUserCanUploadImageDefault.value
  })

  const i18nStore = useI18nStore()

  const openPermissionAdminContactNotif = () => {
    potoNotification({
      type: 'info',
      title: i18nStore.t('permissionAdminContactText')(),
      message:
        pbCollectionConfigQuery.data.value?.[
          'admin-contact-info-for-permission'
        ],
    })
  }

  return {
    permissionSendMessage,
    permissionUploadImage,
    openPermissionAdminContactNotif,
  }
}
