import { pbConfigGetFullListApi } from '@/api'
import {
  pbCollectionConfigDefaultGetFn,
  pbCollectionConfigSchema,
  queryConfig,
} from '@/config'
import { Collections, onPbResErrorStatus401AuthClear, pb } from '@/lib'
import { queryKeys, queryRetryPbNetworkError } from '@/queries'
import { usePlaceholderDataPbCollectionConfigStore } from '@/stores'
import { fetchWithTimeoutPreferred } from '@/utils'
import { useQuery } from '@tanstack/vue-query'

/**
 * pocketbase 集合 config 的 useQuery
 *
 * 会将 config集合 的数组式数据转为对象，类型即为PbCollectionConfigType `src\config\pb-collection-config.ts`
 */
export const usePbCollectionConfigQuery = () => {
  const placeholderDataStore = usePlaceholderDataPbCollectionConfigStore()

  const query = useQuery({
    // 查询键
    queryKey: queryKeys.pbCollectionConfig(),
    // 查询函数
    queryFn: async () => {
      // pb 请求
      const pbRes = await pbConfigGetFullListApi()
      // console.log(pbRes)

      // 数据处理
      // 首先用 默认数据初始化一个对象 queryData
      const queryData = pbCollectionConfigDefaultGetFn()
      // 根据键值遍历 queryData
      const queryDataKeys = Object.keys(queryData) as (keyof typeof queryData)[]
      queryDataKeys.forEach((key) => {
        // 在 pbRes 查找 key
        const findKeyItem = pbRes.find((i) => i.key === key)
        // 没找到则跳过（将使用默认值）
        if (findKeyItem == null) {
          console.error(
            'src\\queries\\pb-collection-config.ts\n' +
              'usePbCollectionConfigQuery\n' +
              'findKeyItem == null\n' +
              `key: ${key}`
          )
          return
        }
        // 找到，进行类型校验
        const findKeyItemParseResult = pbCollectionConfigSchema[key].safeParse(
          findKeyItem.value
        )
        // 校验不成功则跳过（将使用默认值）
        if (findKeyItemParseResult.success === false) {
          console.error(
            'src\\queries\\pb-collection-config.ts\n' +
              'usePbCollectionConfigQuery\n' +
              'findKeyItemParseResult.success === false\n' +
              `key: ${key}`
          )
          return
        }
        // 校验成功，赋值给 queryData[key]
        // queryData[key] = findKeyItemParseResult.data
        // 上面的会有类型问题，
        // 直接赋值 queryData[key] = ... 会因类型推断不精确而报错（类型为 never）
        // 使用泛型函数 queryDataKeyValueUpdate 可保障 key 与 value 类型正确绑定
        // 笔记: note\笔记\250804-TypeScript类型体操笔记：动态键赋值为何会报类型错误，以及如何优雅解决.md
        const queryDataKeyValueUpdate = <K extends keyof typeof queryData>(
          key: K,
          value: (typeof queryData)[K]
        ) => {
          queryData[key] = value
        }
        queryDataKeyValueUpdate(key, findKeyItemParseResult.data)
      })
      // console.log(queryData)

      // 将完成的queryData持久化，以用于placeholderData
      placeholderDataStore.set(queryData)

      return queryData
    },
    // 占位数据
    placeholderData: computed(() => {
      if (placeholderDataStore.data != null) {
        return placeholderDataStore.data
      }
      return pbCollectionConfigDefaultGetFn()
    }),
    // 缓存时间
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  return {
    ...query,
  }
}
