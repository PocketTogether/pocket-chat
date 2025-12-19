import { Collections, pb, type ImagesResponse, type UsersResponse } from '@/lib'
import { fetchWithTimeoutPreferred } from '@/utils'

export type ImagesResponseWithExpand = ImagesResponse<{
  author?: UsersResponse
}>

/** 图片分页查询，普通分页 */
export const pbImagePageListApi = async (
  /** 要查询的页面数字 */
  page: number,
  data: {
    /** 查询指定用户的 */
    author?: string | null
    /** 搜索 */
    search?: string | null
  }
) => {
  // TODO 类型安全地构造 expand filter sort 字符串

  const filter = (() => {
    // 查询指定用户的
    const filterAuthorPart = (() => {
      if (data.author == null || data.author === '') {
        return null
      }
      const author = data.author
      return `author='${author}'`
    })()
    // 搜索
    const filterSearchPart = (() => {
      if (data.search == null || data.search === '') {
        return null
      }
      const search = data.search
      return `( alt~'${search}' || keyword~'${search}' || author.username='${search}' || author.name='${search}' )`
    })()

    // 合并为 filter
    if (filterAuthorPart != null && filterSearchPart != null) {
      return `( ${filterAuthorPart} && ${filterSearchPart} )`
    } else if (filterAuthorPart != null && filterSearchPart == null) {
      return filterAuthorPart
    } else if (filterAuthorPart == null && filterSearchPart != null) {
      return filterSearchPart
    } else {
      // ilterAuthorPart == null && filterSearchPart == null
      return undefined
    }
  })()

  const pbRes = await pb
    .collection(Collections.Images)
    .getList<ImagesResponseWithExpand>(page, 30, {
      // 日期降序，（日期相同时）id升序
      sort: '-created,id',
      filter: filter,
      expand: 'author',
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })
  return pbRes
}
