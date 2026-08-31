export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  factor?: number
  jitter?: boolean
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3
  const initialDelayMs = options.initialDelayMs ?? 100
  const maxDelayMs = options.maxDelayMs ?? 3000
  const factor = options.factor ?? 2
  const useJitter = options.jitter ?? true

  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (error) {
      attempt++
      if (attempt > maxRetries) {
        throw error
      }

      let delay = Math.min(initialDelayMs * Math.pow(factor, attempt - 1), maxDelayMs)
      if (useJitter) {
        delay = Math.floor(Math.random() * delay)
      }

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}
