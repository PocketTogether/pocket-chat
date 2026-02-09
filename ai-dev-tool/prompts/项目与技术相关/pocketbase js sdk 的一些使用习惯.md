pocketbase js sdk 的一些使用习惯
```
封装在 src/api 比较好
如 E:\Project\pocket-chat\vue3\src\api\users.ts
import { Collections, pb } from '@/lib'
import { fetchWithTimeoutPreferred } from '@/utils'
/** users集合 getOne */
export const pbUsersGetOneApi = async (id: string) => {
  const pbRes = await pb.collection(Collections.Users).getOne(id, {
    // timeout为5000
    fetch: fetchWithTimeoutPreferred,
  })
  return pbRes
}
……
```
