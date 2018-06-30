import { dNode, createElement, h } from "./vdom";

interface RevocableProxy<T extends object> {
  proxy: T;
  revoke: () => void;
}

export class Doge<S extends object = object, P extends object= object> {
  private $state: RevocableProxy<S>
  private $prop: RevocableProxy<P>
  private $el: HTMLElement | undefined
  private batch: any[] = []
  private patchToken: number = -1

  constructor(prop: any = {}, state: any = {}) {
    this.$state = this.observe(state)
    this.$prop = this.observe(prop)
  }

  public get state(): S {
    return this.$state.proxy
  }

  public get prop(): P {
    return this.$prop.proxy
  }

  public destroyed() {
    this.$state.revoke()
    this.$prop.revoke()
  }

  public mount(anchor: HTMLElement | string) {
    let parent: HTMLElement | null
    let self: HTMLElement | null

    if (anchor instanceof HTMLElement) {
      parent = anchor.parentElement
      self = anchor
    } else {
      self = document.querySelector(anchor)
      if (self == null) {
        throw new Error(`Element "${anchor}" not exist.`)
      } else {
        parent = self.parentElement
      }
    }

    if (parent == null) {
      throw new Error('?')
    } else {
      const node = this.render(h)
      if (node === void 0) {
        throw new Error('?')
      } else {
        // TODO
        const el = createElement(node) as HTMLElement
        parent.replaceChild(el, self)
        this.$el = el
      }
    }
  }

  public render(h: any): dNode | undefined {
    return
  }

  private observe<T extends object>(target: T): RevocableProxy<T> {
    const p = this.proxify(target)

    Object.entries(target).forEach(([key, value]) => {
      if (typeof value === 'object') {
        // TODO
        // @ts-ignore
        target[key] = this.observe(value).proxy
      }
    })

    return p
  }

  private proxify<T extends object>(target: T): RevocableProxy<T> {
    const _this = this

    return Proxy.revocable(target, {
      get(target, prop, receiver) {
        // TODO
        // console.log('get', target, prop);

        return Reflect.get(target, prop, receiver)
      },
      set(target, prop, value, receiver) {
        // console.log('set', target, prop, value);

        // TODO
        if (!Reflect.set(target, prop, value, receiver)) {
          return false
        } else {
          // TODO: batch patch
          _this.patch()
          return true
        }
      },
      defineProperty(target, key, descriptor) {
        if (!Reflect.defineProperty(target, key, descriptor)) {
          return false
        } else {
          // TODO: batch patch
          _this.patch()
          return true
        }
      },
    })
  }

  private patch() {
    if (this.patchToken === -1) {
      this.patchToken = setTimeout(() => {
        this.mount(this.$el as HTMLElement)
        this.patchToken = -1
      });
    }
  }
}
