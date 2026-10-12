import { ReactiveFramework } from "../../src/framework.js"
import { ReactiveEngineCore } from '@pravosleva/reactive-engine'

const engine = new ReactiveEngineCore()

export const reactiveEngineFrameork: ReactiveFramework = {
  name: "@pravosleva/reactive-engine",

  signal<T>(initialValue: T) {
    const sig = engine.signal(initialValue)
    return {
      read: () => sig.value,
      write: (newValue: T) => {
        sig.value = newValue
      }
    }
  },

  computed<T>(fn: () => T) {
    const comp = engine.computed(fn)
    return {
      read: () => comp.value
    }
  },

  effect(fn: () => void | (() => void)) {
    const unsubscribe = engine.effect(fn)
    return () => unsubscribe()
  },

  run(fn: () => void) {
    return fn()
  },

  batch(fn: () => void) {
    engine.batch(fn)
  },

  untracked<T>(fn: () => T): T {
    return engine.untrack(fn)
  }
}
