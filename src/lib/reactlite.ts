import {
  INode,
  CreateContext,
  IContext,
  IDoge,
} from './type';
import { vNodeTextType, } from './vdom';
import { Context, h } from './core';
import { createDomElement, setAttribute } from './dom';
import { deepcopy } from './util';

function reconcile(
  parent: HTMLElement | null,
  oldCtx: IContext,
  newCtx: IContext,
): IContext {
  if (parent == null) throw new Error('');

  if (oldCtx.isEmpty && !newCtx.isEmpty) {
    newCtx.dom = createDomElement(newCtx.node as INode);
    parent.appendChild(newCtx.dom);
  } else if (!oldCtx.isEmpty && newCtx.isEmpty) {
    parent.removeChild(oldCtx.dom as Node);
    return Context.empty();
  } else if (oldCtx.node.type !== newCtx.node.type) {
    newCtx.dom = createDomElement(newCtx.node);
    parent.replaceChild(newCtx.dom, oldCtx.dom as Node);
  } else if (oldCtx.instance) {
    /**
     * TODO:
     * 若新节点刚好为不同的组件，或为新的普通元素，但根元素类型一致，
     * 下列处理流程会导致新节点无法正确渲染
     */

    // TODO: 组件树被重建了两次
    const oldInstance = oldCtx.instance;
    // @ts-ignore
    oldInstance.prop = newCtx.instance.prop;
    oldCtx.instance = null;
    newCtx = reconcile(parent, oldCtx, oldInstance.render(h));
    oldCtx.instance = oldInstance;
    newCtx.instance = oldInstance;
    return newCtx;
  } else {
    if (oldCtx.node.type === vNodeTextType) {
      newCtx.dom = updateElementText(oldCtx, newCtx);
    } else {
      newCtx.dom = updateElementAttr(oldCtx, newCtx);
    }
  }

  const childCount = Math.max(
    oldCtx.children.length,
    newCtx.children.length
  );
  for (let i = 0; i < childCount; i++) {
    const context = reconcile(
      newCtx.dom as HTMLElement,
      oldCtx.children[i] || Context.empty(),
      newCtx.children[i] || Context.empty(),
    );
    if (!context.isEmpty) newCtx.children[i] = context;
  }

  return newCtx as IContext;
}

function updateElementText(oldCtx: IContext, newCtx: IContext): HTMLElement | Text | null {
  const dom = oldCtx.dom as Text;

  if (dom.textContent !== newCtx.node.text) {
    dom.textContent = newCtx.node.text;
  }

  return oldCtx.dom;
}

function updateElementAttr(oldCtx: IContext, newCtx: IContext): HTMLElement | Text | null {
  // TODO
  Object.entries(newCtx.node.attrs).forEach(([key, value]) =>
    setAttribute(oldCtx.dom as HTMLElement, key, value)
  );
  return oldCtx.dom;
}

export class ReactLite<S = any, P = any> implements IDoge {
  public state: S;
  public prop: P;
  private prevState: S;
  // private batch: Array<() => void> = []
  private patchToken: number = -1;
  private commits: Array<Partial<S>> = [];
  public context: IContext = new Context();

  constructor(prop: any = {}, state: any = {}) {
    this.state = state;
    this.prop = prop;
    this.prevState = {} as any;
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

  public mount(anchor: HTMLElement | string) {
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
    } else {
      // TODO: 组件树被递归了两次
      this.context = reconcile(self, Context.empty(), this.render(h));
      this.context.instance = this;

      parent.replaceChild(this.context.dom as Node, self);
    }
  }

  public render(h: CreateContext): IContext {
    return new Context();
  }

  private commit(frag: Partial<S>) {
    this.commits.push(frag);
  }

  private diff() {
    if (this.context.dom == null) return;

    this.context = reconcile(
      this.context.dom.parentElement as HTMLElement,
      this.context,
      Object.assign({}, this.render(h), { instance: this })
    );
    this.context.instance = this;
  }

  private patch() {
    if (this.hasPatchScheduled) return;

    this.patchToken = setTimeout(() => {
      this.commits.forEach(commit => Object.assign(this.state, commit));
      this.commits = [];

      // console.log('old', this.prevState);
      // console.log('new', this.state);

      this.diff();
      // console.log('rendered');

      this.patchToken = -1;
    });
  }
}
