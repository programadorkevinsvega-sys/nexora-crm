

class Container {
  private registry = new Map<symbol, unknown>()

  register<T>(token: symbol, implementation: T): void {
    this.registry.set(token, implementation)
  }

  resolve<T>(token: symbol): T {
    const impl = this.registry.get(token)
    if (!impl) throw new Error(`No implementation registered for token ${String(token)}`)
    return impl as T
  }
}

export const container = new Container()
