import {
  IDictionary,
  IElement,
  FiberTag,
  IFiber,
  IReact,
} from './type';
import { scheduleWork } from './scheduler';
import { Fiber } from './fiber';

function mount(el: string | HTMLElement, ...children: IElement[]) {
  let hostDom;
  if (typeof el === 'string') {
    hostDom = document.querySelector(el);
  } else {
    hostDom = el;
  }

  if (!el) throw new Error();

  scheduleWork({
    from: FiberTag.HOST_ROOT,
    hostDom,
    newProp: {
      children,
    }
  });
}

class ReactFiber<S extends IDictionary = any, P extends IDictionary = any> implements IReact {
  public state: S = {} as any;
  public prop: P;
  public fiber: IFiber = new Fiber();
  public _rootFiber_: IFiber = new Fiber();

  constructor(prop?: P) {
    this.prop = prop || {} as P;
    // this.fiber = new Fiber({
    //   tag: FiberTag.CLASS_COMPONENT,
    // })
  }

  public setState(stateFn: (state: S, prop: P) => Partial<S>): void {
    // TODO
    const partialState = stateFn(this.state, this.prop);

    scheduleWork({
      from: FiberTag.CLASS_COMPONENT,
      instance: this,
      partialState,
    });
  }

  public render(): IElement | IElement[] {
    return new Fiber();
  }
}

export {
  mount,
  ReactFiber,
};
