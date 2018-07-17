interface IDictionary<T = any> {
  [key: string]: T;
}

interface IProp extends IDictionary<any> {
  children?: IElement[];
}

interface IElement {
  type: string | ElementType | ReactConstuctor;
  prop: IProp;
}

const enum ElementType {
  TEXT = '__TEXT__',
  COMMENT = '__COMMENT__',
}

const enum FiberTag {
  HOST_ROOT,
  HOST_COMPONENT,
  CLASS_COMPONENT,
}

const enum FiberEffectTag {
  NONE,
  PLACEMENT,
  DELETION,
  UPDATE,
}

interface IFiber {
  tag: FiberTag;
  type: string | ElementType | ReactConstuctor;
  prop: IProp;

  parent: IFiber | null;
  sibling: IFiber | null;
  child: IFiber | null;

  stateNode: IReact | IFiberReferencedElement | null;

  alternate: IFiber | null;

  partialState: IDictionary | null;

  effectTag: FiberEffectTag;
  effects: IFiber[];
}

/**
 * 根fiber节点的引用
 *
 * 在某些组件（如函数式组件）中，其没有组件实例对象，
 * 只有HTMLElement类型的根元素，为了保留根fiber引用，
 * 需要在根元素对象上进行暂存
 *
 * @interface IFiberReferencedElement
 * @extends {Node}
 */
interface IFiberReferencedElement extends Node {
  _rootFiber_?: IFiber;
}

type createElement = (type: string, prop: IDictionary | null, ...children: Array<string | IElement>) => IElement;

type ReactConstuctor = new (prop: IDictionary) => IReact;

interface IReact<S = any, P = any> {
  state: S;
  prop: P;
  fiber: IFiber;
  _rootFiber_: IFiber;

  setState(stateFn: (state: S, prop: P) => Partial<S>): void;
  render(): IElement | IElement[];
}

export {
  IDictionary,
  IProp,
  IElement,
  ElementType,
  FiberTag,
  FiberEffectTag,
  IFiber,
  IFiberReferencedElement,
  createElement,
  ReactConstuctor,
  IReact,
};
