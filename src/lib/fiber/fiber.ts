import {
  IDictionary,
  IProp,
  ElementType,
  FiberTag,
  FiberEffectTag,
  IFiberReferencedElement,
  IFiber,
  IReact,
  ReactConstuctor,
} from './type';

interface IFiberOptions extends Partial<IFiber> { }

class Fiber implements IFiber {
  public tag: FiberTag;
  public type: string | ElementType | ReactConstuctor;
  public prop: IProp;
  public parent: IFiber | null;
  public sibling: IFiber | null;
  public child: IFiber | null;
  public stateNode: IReact | IFiberReferencedElement | null;
  public alternate: IFiber | null;
  public partialState: IDictionary | null;
  public effectTag: FiberEffectTag;
  public effects: IFiber[];

  constructor(options: IFiberOptions = {}) {
    this.tag = options.tag || FiberTag.HOST_ROOT;
    this.type = options.type || '';
    this.prop = options.prop || {};
    this.parent = options.parent || null;
    this.sibling = options.sibling || null;
    this.child = options.child || null;
    this.stateNode = options.stateNode || null;
    this.alternate = options.alternate || null;
    this.partialState = options.partialState || null;
    this.effectTag = options.effectTag || FiberEffectTag.NONE;
    this.effects = options.effects || [];
  }
}

export {
  Fiber
};
