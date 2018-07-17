import {
  INode,
  CreateElement,
  IKeyHash,
  IContext,
  IReactLite,
  ReactLiteConstructor,
  IDictionary,
} from './type';
import { vNode } from './vdom';
import { Context, h } from './core';
import { createDomElement, updateDomTextContent, updateDomAttributes } from './dom';
import { deepcopy } from './util';

function instantiate(node: INode): IContext {
  if (node.isEmpty) return Context.empty();

  if (node.isDom) {
    const dom = createDomElement(node);
    const children = node.children.map(instantiate);

    /**
     * TODO: 该操作会导致子代元素无论是否为数组map生成，均会要求指定key
     */
    const keyHashes: IDictionary<IKeyHash> = children.reduce(
      (dic, child, index) => {
        const key = child.node.attrs.key;
        return Object.assign<IDictionary<IKeyHash>, IDictionary<IKeyHash> | undefined>(
          dic, key !== void 0 ? { [key]: { index, context: child } } : undefined
        );
      }, {});

    children.forEach(child => dom.appendChild(child.dom as Node));

    return Object.assign(Context.empty(), {
      node,
      dom,
      children,
      keyHashes,
    });
  } else {
    const ctor = node.type as ReactLiteConstructor;
    const instance = new ctor(node.attrs, node.children);

    instance.subContext = Object.assign(
      instantiate(instance.render(h)),
      { instance }
    );

    return instance.context = Object.assign(Context.empty(), {
      instance, node, dom: instance.subContext.dom
    });
  }
}

function addNode(parent: HTMLElement, node: INode): IContext {
  const instance = instantiate(node as INode);
  parent.appendChild(instance.dom as Node);
  return instance;
}

function removeNode(parent: HTMLElement, context: IContext): IContext {
  parent.removeChild(context.dom as Node);
  return Context.empty();
}

function reconcile(
  parent: HTMLElement | null,
  oldCtx: IContext,
  newNode: INode,
): IContext {
  if (parent == null) throw new Error('');

  if (oldCtx.isEmpty && !newNode.isEmpty) {
    return addNode(parent, newNode);
  } else if (!oldCtx.isEmpty && newNode.isEmpty) {
    return removeNode(parent, oldCtx);
  } else if (oldCtx.node.type !== newNode.type) {
    // 当新老节点type不一致时，替换老节点
    const instance = instantiate(newNode as INode);
    parent.replaceChild(instance.dom as Node, oldCtx.dom as Node);
    return instance;
  } else if (newNode.isDom) {
    // 当新老节点type一致时
    if (newNode.isText) {
      // 如果节点类型为文本，直接更新老节点的文本内容
      oldCtx.dom = updateDomTextContent(oldCtx.dom as Text, newNode.text);
      return oldCtx;
    } else {
      // 如果节点类型为普通dom，直接更新老节点元素的属性
      oldCtx.dom = updateDomAttributes(oldCtx.dom as HTMLElement, newNode.attrs);

      // 比较子节点
      const [children, keyHashes] = reconcileChildren(oldCtx, newNode);
      return Object.assign(oldCtx, { children, keyHashes });
    }
  } else {
    // 当新老节点均为相同类型的组件时
    const instance = Object.assign(
      oldCtx.instance,
      {
        prop: newNode.attrs,
        childNodes: newNode.children,
      }
    );
    const node = instance.render(h);
    instance.subContext = reconcile(parent, instance.subContext, node);

    return Object.assign(oldCtx, { dom: instance.subContext.dom });
  }
}

/**
 * 调和子代节点
 *
 * 时间复杂度：O(max(m, n) + p), p∈[0, m]
 *
 * @param {IContext} oldCtx 上一个context
 * @param {INode} newNode 新节点
 * @returns {[IContext[], IDictionary<IKeyHash>]}
 */
function reconcileChildren(oldCtx: IContext, newNode: INode): [IContext[], IDictionary<IKeyHash>] {
  const childContexts = [];
  const childCount = Math.max(oldCtx.children.length, newNode.children.length);
  const oldKeyHashes = oldCtx.keyHashes;
  const newKeyHashes: IDictionary<IKeyHash> = {};
  const recycle: IDictionary<IContext> = {};

  function hasKey(node: INode): boolean {
    return node.attrs.key !== void 0;
  }

  function findCache(key: string): IContext {
    let cache;

    const context = oldKeyHashes[key];
    if (context !== void 0) {
      cache = context.context;
      oldCtx.children.splice(context.index, 1, Context.empty());
    } else {
      cache = recycle[key];
      delete recycle[key];
    }

    return cache || Context.empty();
  }

  function reconcileChild(context: IContext, node: INode) {
    return reconcile(oldCtx.dom as HTMLElement, context, node);
  }

  for (let i = 0; i < childCount; i++) {
    let oldChildCtx: IContext = oldCtx.children[i] || Context.empty();
    const newChildNode: INode = newNode.children[i] || vNode.empty();

    if (newChildNode.isEmpty) {
      if (oldChildCtx.isEmpty) {
        continue;
      } else if (!hasKey(oldChildCtx.node)) {
        removeNode(oldCtx.dom as HTMLElement, oldChildCtx);
      } else {
        recycle[oldChildCtx.node.attrs.key] = oldChildCtx;
      }
    } else if (!hasKey(newChildNode)) {
      if (oldChildCtx.isEmpty) {
        childContexts.push(addNode(oldCtx.dom as HTMLElement, newChildNode));
      } else if (!hasKey(oldChildCtx.node)) {
        childContexts.push(reconcileChild(oldChildCtx, newChildNode));
      } else {
        childContexts.push(addNode(oldCtx.dom as HTMLElement, newChildNode));
        recycle[oldChildCtx.node.attrs.key] = oldChildCtx;
      }
    } else {
      const newKey = newChildNode.attrs.key;
      const pairOldCtx = findCache(newKey);

      let context: IContext;
      if (pairOldCtx.isEmpty) {
        childContexts.push(context = addNode(oldCtx.dom as HTMLElement, newChildNode));
      } else {
        childContexts.push(context = reconcileChild(pairOldCtx, newChildNode));
      }
      newKeyHashes[newKey] = { index: i, context };

      /**
       * HACK: 如果新节点含key，且与处在子代数组同一位置的老节点的key刚好一致，
       * 则数组中的老节点会在之前的findCache调用中被置为empty，
       * 然而oldChildCtx依然指向了置为empty前的老节点引用，故此处重新赋值
       */
      if (oldChildCtx.node.attrs.key === newKey) {
        oldChildCtx = Context.empty();
      }

      if (oldChildCtx.isEmpty) {
        continue;
      } else if (!hasKey(oldChildCtx.node)) {
        removeNode(oldCtx.dom as HTMLElement, oldChildCtx);
      } else {
        recycle[oldChildCtx.node.attrs.key] = oldChildCtx;
      }
    }
  }

  Object.keys(recycle).forEach(key => {
    removeNode(oldCtx.dom as HTMLElement, recycle[key]);
  });

  return [childContexts, newKeyHashes];
}

export class ReactLite<S = any, P = any> implements IReactLite {
  public state: S = {} as any;
  public prop: P;
  public context: IContext = Context.empty();
  public subContext: IContext = Context.empty();

  protected childNodes: INode[];
  private prevState: S = {} as any;
  private patchToken: number = -1;
  private commits: Array<Partial<S>> = [];

  constructor(prop: any = {}, childNodes: INode[] = []) {
    this.prop = prop;
    this.childNodes = childNodes;
  }

  public static mount(
    anchor: HTMLElement | string,
    node: INode | ((h: CreateElement) => INode)
  ): ReactLite {

    let parent: HTMLElement | null;
    let self: HTMLElement | null;

    if (anchor instanceof HTMLElement) {
      parent = anchor.parentElement;
      self = anchor;
    } else {
      self = document.querySelector(anchor);
      if (self == null) {
        throw new Error(`Element "${anchor}" not exist.`);
      } else {
        parent = self.parentElement;
      }
    }

    if (parent == null) {
      throw new Error('?');
    }

    const root = node instanceof Function ? node(h) : node;
    const context = reconcile(self, Context.empty(), root);

    parent.replaceChild(context.dom as Node, self);
    return context.instance as ReactLite;
  }

  private get hasStateModified(): boolean {
    return this.commits.length !== -1;
  }

  private get hasPatchScheduled(): boolean {
    return this.patchToken !== -1;
  }

  public setState(commit: object | ((prevState: S, prop: P) => Partial<S>)) {
    if (this.hasStateModified) {
      this.prevState = deepcopy(this.state);
    }

    if (typeof commit === 'function') {
      this.commit(commit(this.prevState, this.prop));
    } else {
      this.commit(commit);
    }

    this.patch();
  }

  public render(h: CreateElement): INode {
    return vNode.empty();
  }

  private commit(frag: Partial<S>) {
    this.commits.push(frag);
  }

  private diff() {
    if (this.context.dom == null) return;

    this.subContext = reconcile(
      this.context.dom.parentElement as HTMLElement,
      this.subContext,
      this.render(h),
    );
    this.context.dom = this.subContext.dom;
  }

  private patch() {
    if (this.hasPatchScheduled) return;

    this.patchToken = setTimeout(() => {
      this.commits.forEach(commit => Object.assign(this.state, commit));
      this.commits = [];

      this.diff();

      this.patchToken = -1;
    });
  }
}
