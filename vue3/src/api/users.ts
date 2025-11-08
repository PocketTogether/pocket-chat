import {
  Collections,
  onPbResErrorStatus401AuthClear,
  pb,
  type Create,
  type Update,
} from '@/lib'
import {
  fetchWithTimeoutForPbRequestWillEmail,
  fetchWithTimeoutPreferred,
} from '@/utils'

/** users集合 authRefresh 需登录 */
export const pbUsersAuthRefreshApi = async () => {
  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  const pbRes = await pb
    .collection(Collections.Users)
    .authRefresh({
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
    .catch((error) => {
      // 出现鉴权失败则清除authStore
      onPbResErrorStatus401AuthClear(error)
      throw error
    })
  return pbRes
}

/** users集合 listAuthMethods */
export const pbUsersListAuthMethodsApi = async () => {
  const pbRes = await pb.collection(Collections.Users).listAuthMethods({
    // timeout为5000
    fetch: fetchWithTimeoutPreferred,
  })
  return pbRes
}

/** users集合 getOne */
export const pbUsersGetOneApi = async (id: string) => {
  const pbRes = await pb.collection(Collections.Users).getOne(id, {
    // timeout为5000
    fetch: fetchWithTimeoutPreferred,
  })
  return pbRes
}

/** users集合 authWithPassword （登录） */
export const pbUsersAuthWithPasswordApi = async (
  usernameOrEmail: string,
  password: string
) => {
  const pbRes = await pb
    .collection(Collections.Users)
    .authWithPassword(usernameOrEmail, password, {
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
  return pbRes
}

/** users集合 create 注册 */
export const pbUsersCreateRegisterApi = async (data: {
  username: string
  email: string
  password: string
  passwordConfirm: string
}) => {
  // 准备数据
  const createData: Create<Collections.Users> = {
    username: data.username,
    email: data.email,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
  }

  // 通过 pocketbase SDK 请求
  const pbRes = await pb.collection(Collections.Users).create(createData, {
    // timeout为5000
    fetch: fetchWithTimeoutPreferred,
  })
  return pbRes
}

/** users集合 requestPasswordReset */
export const pbUsersRequestPasswordResetApi = async (email: string) => {
  const pbRes = await pb
    .collection(Collections.Users)
    .requestPasswordReset(email, {
      // 服务端pocketbase将发送邮件，用时比较长
      // timeout为30秒
      fetch: fetchWithTimeoutForPbRequestWillEmail,
    })
  return pbRes
}

/** users集合 requestVerification */
export const pbUsersRequestVerificationApi = async (email: string) => {
  const pbRes = await pb
    .collection(Collections.Users)
    .requestVerification(email, {
      // 服务端pocketbase将发送邮件，用时比较长
      // timeout为30秒
      fetch: fetchWithTimeoutForPbRequestWillEmail,
    })
  return pbRes
}

/** users集合 requestEmailChange 需登录 */
export const pbUsersRequestEmailChangeApi = async (newEmail: string) => {
  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  const pbRes = await pb
    .collection(Collections.Users)
    .requestEmailChange(newEmail, {
      // requestEmailChange 服务端pocketbase将发送邮件，用时比较长
      // timeout为30秒
      fetch: fetchWithTimeoutForPbRequestWillEmail,
    })
    .catch((error) => {
      // 出现鉴权失败则清除authStore
      onPbResErrorStatus401AuthClear(error)
      throw error
    })

  return pbRes
}

/** users集合 update 修改昵称与名称 需登录 */
export const pbUsersUpdateNameBioApi = async (data: {
  name: string
  bio: string
}) => {
  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备数据
  const updateData: Update<Collections.Users> = {
    name: data.name,
    bio: data.bio,
  }

  const pbRes = await pb
    .collection(Collections.Users)
    .update(pb.authStore.record.id, updateData, {
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
    .catch((error) => {
      // 出现鉴权失败则清除authStore
      onPbResErrorStatus401AuthClear(error)
      throw error
    })

  return pbRes
}

/** users集合 update 修改用户名 需登录 */
export const pbUsersUpdateUsernameApi = async (data: { username: string }) => {
  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备数据
  const updateData: Update<Collections.Users> = {
    username: data.username,
  }

  // 通过 pocketbase SDK 请求
  const pbRes = await pb
    .collection(Collections.Users)
    .update(pb.authStore.record.id, updateData, {
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
    .catch((error) => {
      // 出现鉴权失败则清除authStore
      onPbResErrorStatus401AuthClear(error)
      throw error
    })
  return pbRes
}

/** users集合 update 修改头像 需登录 */
export const pbUsersUpdateAvatarApi = async (data: { avatar: File }) => {
  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备数据
  const updateData = {
    avatar: data.avatar,
    // 确保 'avatar' 是 Update<Collections.Users> 的有效键，防止拼写错误。
  } satisfies Partial<Record<keyof Update<Collections.Users>, File>>

  // 通过 pocketbase SDK 请求
  const pbRes = await pb
    .collection(Collections.Users)
    .update(pb.authStore.record.id, updateData, {
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
    .catch((error) => {
      // 出现鉴权失败则清除authStore
      onPbResErrorStatus401AuthClear(error)
      throw error
    })

  return pbRes
}

// export const pbApi = async () => {}
