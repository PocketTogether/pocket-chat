import type { UsersResponse } from '@/lib'
import { defineStore } from 'pinia'
import { ref } from 'vue'

type ProfileQueryData = UsersResponse

// 用于 useProfileQuery 的 placeholderData
export const usePlaceholderDataProfileStore = defineStore(
  'pocket-together-usePlaceholderDataProfileStore',
  () => {
    const data = ref<ProfileQueryData | null>(null)
    const set = (newData: ProfileQueryData | null) => {
      data.value = newData
    }
    return {
      data,
      set,
    }
  },
  {
    persist: true, // 持久化
  }
)
