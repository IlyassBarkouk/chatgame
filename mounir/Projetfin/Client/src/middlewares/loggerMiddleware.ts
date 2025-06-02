import type { Middleware } from 'redux'

const loggerMiddleware: Middleware = (store) => (next) => (action) => {
    const type = (action as { type: string }).type
    console.group(type)
    console.log('Previous state:', store.getState())
    console.log('Action:', action)
    const result = next(action)
    console.log('Next state:', store.getState())
    console.groupEnd()
    return result
  }
  

export default loggerMiddleware
