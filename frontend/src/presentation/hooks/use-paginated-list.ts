"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface QueryResult<T> {
  data?: { data: T[]; nextCursor?: string | null }
  isLoading: boolean
  isError: boolean
  error?: Error | null
}

interface PaginatedReturn<T> {
  items: T[]
  nextCursor: string | null | undefined
  isLoading: boolean
  isLoadingMore: boolean
  isError: boolean
  error: Error | null
  loadMore: () => void
  reset: () => void
}

export function usePaginatedList<T>(
  queryResult: QueryResult<T>,
  cursor: string | undefined,
  setCursor: (c: string | undefined) => void,
): PaginatedReturn<T> {
  const [items, setItems] = useState<T[]>([])
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const prevCursorRef = useRef<string | undefined>(cursor)
  const keyRef = useRef(0)

  useEffect(() => {
    if (!queryResult.data) return

    const { data: newData, nextCursor: nc } = queryResult.data

    if (!cursor) {
      setItems(newData)
      keyRef.current += 1
    } else if (cursor !== prevCursorRef.current) {
      setItems((prev) => [...prev, ...newData])
      prevCursorRef.current = cursor
    }

    setNextCursor(nc)
    setIsLoadingMore(false)
  }, [queryResult.data])

  const loadMore = useCallback(() => {
    if (nextCursor) {
      setIsLoadingMore(true)
      setCursor(nextCursor)
    }
  }, [nextCursor, setCursor])

  const reset = useCallback(() => {
    setItems([])
    setCursor(undefined)
    setNextCursor(null)
    setIsLoadingMore(false)
    prevCursorRef.current = undefined
    keyRef.current += 1
  }, [setCursor])

  return {
    items,
    nextCursor,
    isLoading: queryResult.isLoading && !cursor,
    isLoadingMore,
    isError: queryResult.isError,
    error: queryResult.error ?? null,
    loadMore,
    reset,
  }
}
