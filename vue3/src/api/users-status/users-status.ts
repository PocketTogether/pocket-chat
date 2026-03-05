import {
  pocketbaseConfig,
  usersPresencesStatusInitGetListApiPerPageNumConfig,
} from '@/config'
import {
  Collections,
  pb,
  type Create,
  type UsersNotViewingMarksResponse,
  type UsersPresencesStatusRecord,
  type UsersPresencesStatusResponse,
} from '@/lib'
import { fetchWithTimeoutPreferred, urlJoinUtil } from '@/utils'
import type { RecordSubscription } from 'pocketbase'
import {
  usersPresencesStatusBaseExpand,
  type UsersPresencesStatusResponseWithBaseExpand,
} from './base'
import type { Group, KeyValueMirror } from '@/types'

/** 🧠 类型安全地构造 sort 字符串 */
const usersPresencesStatusInitGetListSort = (() => {
  const recordKeys = {
    created: 'created',
    id: 'id',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof UsersPresencesStatusRecord>>
  >

  return `-${recordKeys.created},${recordKeys.id}` as const
  // type const = "-created,id"
})()

// userPresencesStatus查询前500条函数
export const pbUsersPresencesStatusInitGetListApi = async () => {
  const pbRes = await pb
    .collection(Collections.UsersPresencesStatus)
    .getList<UsersPresencesStatusResponseWithBaseExpand>(
      1,
      usersPresencesStatusInitGetListApiPerPageNumConfig,
      {
        expand: usersPresencesStatusBaseExpand,
        sort: usersPresencesStatusInitGetListSort,
        // filter, 不需要
        fetch: fetchWithTimeoutPreferred,
      }
    )
  return pbRes
}

// userPresencesStatus实时订阅api函数
export const pbUsersPresencesStatusSubscribeAllApi = async (
  callback: (
    data: RecordSubscription<UsersPresencesStatusResponseWithBaseExpand>
  ) => void
) => {
  return pb
    .collection(Collections.UsersPresencesStatus)
    .subscribe<UsersPresencesStatusResponseWithBaseExpand>(
      '*',
      (e) => {
        callback(e)
      },
      {
        expand: usersPresencesStatusBaseExpand,
        // timeout为5000
        fetch: fetchWithTimeoutPreferred,
      }
    )
}

// usersNotViewingMarks实时订阅api函数，参数是回调函数
export const pbUsersNotViewingMarksSubscribeAllApi = async (
  callback: (data: RecordSubscription<UsersNotViewingMarksResponse>) => void
) => {
  return pb
    .collection(Collections.UsersNotViewingMarks)
    .subscribe<UsersNotViewingMarksResponse>(
      '*',
      (e) => {
        callback(e)
      },
      {
        // expand, 不需要
        // timeout为5000
        fetch: fetchWithTimeoutPreferred,
      }
    )
}

// usersPresencesStatus集合的创建记录接口
export const pbUsersPresencesStatusCreateApi = async (data: {
  isTyping: boolean
  isNotViewing: boolean
}) => {
  const { isTyping, isNotViewing } = data

  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备数据
  const createUsersPresencesStatusData: Create<Collections.UsersPresencesStatus> =
    {
      author: pb.authStore.record.id,
      isTyping,
      isNotViewing,
    }

  const pbRes = pb
    .collection(Collections.UsersPresencesStatus)
    .create(createUsersPresencesStatusData, {
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
  return pbRes
}

export const pbUsersNotViewingMarksCreateApi = async () => {
  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备数据
  const createUsersNotViewingMarksData: Create<Collections.UsersNotViewingMarks> =
    {
      author: pb.authStore.record.id,
    }

  const pbRes = pb
    // (enum member) Collections.UsersNotViewingMarks = "usersNotViewingMarks"
    .collection(Collections.UsersNotViewingMarks)
    .create(createUsersNotViewingMarksData, {
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
  return pbRes
}

// usersNotViewingMarks集合的创建记录接口，
// 不过用的不再是pb sdk了，用的是 navigator.sendBeacon
export const pbUsersNotViewingMarksCreateApiBySendBeacon = () => {
  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备数据
  const createUsersNotViewingMarksData: Create<Collections.UsersNotViewingMarks> =
    {
      author: pb.authStore.record.id,
    }

  // sendBeacon body：必须是 FormData
  const body = (() => {
    const data = createUsersNotViewingMarksData
    // 将 data 转换为 FormData
    const formData = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        continue
      }
      const processedValue = (() => {
        if (typeof value === 'number' || typeof value === 'boolean') {
          return String(value)
        }
        return value
      })()
      formData.append(key, processedValue)
    }
    return formData
  })()

  // 准备url
  const url = (() => {
    const baseUrl = pocketbaseConfig.baseUrl
    // PocketBase REST API：创建记录
    const urlPath = `/api/collections/${Collections.UsersNotViewingMarks}/records`
    return urlJoinUtil(baseUrl, urlPath)
  })()

  // sendBeacon 返回 boolean，表示是否成功排队发送
  const ok = navigator.sendBeacon(url, body)

  return ok
}
