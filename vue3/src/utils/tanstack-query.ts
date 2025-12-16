// utils/queryPick.ts
import type {
  UseQueryReturnType,
  UseInfiniteQueryReturnType,
} from '@tanstack/vue-query'

// note\笔记251120\251216-Vue3 TanStack Query 剩余解构 no-rest-destructuring.md

// 定义你常用的字段集合
export function pickQueryFields<TData, TError>(
  query: UseQueryReturnType<TData, TError>
) {
  const {
    data,
    error,
    status,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isFetched,
    isFetchedAfterMount,
    isRefetching,
    isStale,
    isPaused,
    dataUpdatedAt,
    errorUpdatedAt,
    failureCount,
    fetchStatus,
    refetch,
  } = query

  return {
    data,
    error,
    status,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isFetched,
    isFetchedAfterMount,
    isRefetching,
    isStale,
    isPaused,
    dataUpdatedAt,
    errorUpdatedAt,
    failureCount,
    fetchStatus,
    refetch,
  }
}

// InfiniteQuery 版本
export function pickInfiniteQueryFields<TData, TError>(
  query: UseInfiniteQueryReturnType<TData, TError>
) {
  const {
    data,
    error,
    status,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isFetched,
    isFetchedAfterMount,
    isRefetching,
    isStale,
    isPaused,
    dataUpdatedAt,
    errorUpdatedAt,
    failureCount,
    fetchStatus,
    refetch,

    // ✅ InfiniteQuery 特有
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = query

  return {
    data,
    error,
    status,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isFetched,
    isFetchedAfterMount,
    isRefetching,
    isStale,
    isPaused,
    dataUpdatedAt,
    errorUpdatedAt,
    failureCount,
    fetchStatus,
    refetch,

    // ✅ InfiniteQuery 特有
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  }
}
