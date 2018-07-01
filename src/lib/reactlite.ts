import {
  INode,
  CreateElement,
  IContext,
  IReactLite,
  ReactLiteConstructor,
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

    children.forEach(child => dom.appendChild(child.dom as Node));

    return Object.assign(Context.empty(), { node, dom, children });
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

function reconcile(
  parent: HTMLElement | null,
  oldCtx: IContext,
  newNode: INode,
): IContext {
  if (parent == null) throw new Error('');

  if (oldCtx.isEmpty && !newNode.isEmpty) {
    // 创建新节点
    const instance = instantiate(newNode as INode);
    parent.appendChild(instance.dom as Node);
    return instance;
  } else if (!oldCtx.isEmpty && newNode.isEmpty) {
    // 删除老节点
    parent.removeChild(oldCtx.dom as Node);
    return Context.empty();
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

      // TODO: 可提取方法
      // 比较子节点
      const childCount = Math.max(
        oldCtx.children.length,
        newNode.children.length
      );
      const childContexts = [];
      for (let i = 0; i < childCount; i++) {
        const context = reconcile(
          oldCtx.dom as HTMLElement,
          oldCtx.children[i] || Context.empty(),
          newNode.children[i] || vNode.empty(),
        );
        if (!context.isEmpty) childContexts.push(context);
      }

      return Object.assign(oldCtx, { children: childContexts });
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
