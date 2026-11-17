"use client"
import { useState, useCallback } from "react"
export function usePagination() {
  const [cursors, setCursors] = useState<string[]>([""])
  const [cursorIndex, setCursorIndex] = useState(0)
  const currentCursor = cursors[cursorIndex] ?? null
  const hasPrevious = cursorIndex > 0
  const goNext = useCallback((nextCursor: string | null) => {
    if (!nextCursor) return
    setCursors(prev => [...prev.slice(0, cursorIndex + 1), nextCursor])
    setCursorIndex(prev => prev + 1)
  }, [cursorIndex])
  const goBack = useCallback(() => {
    setCursorIndex(prev => Math.max(0, prev - 1))
  }, [])
  const reset = useCallback(() => {
    setCursors([""])
    setCursorIndex(0)
  }, [])
  return { currentCursor, hasPrevious, goNext, goBack, reset, cursorIndex }
}
