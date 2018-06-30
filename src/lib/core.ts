import {
  INodeAttributes,
  IContext,
  IDoge,
  ReactLiteConstructor,
} from './type';
import { vNode } from './vdom';
import { toString } from './util';

export class Context implements IContext {
  public instance: IDoge | null = null;
  public dom: HTMLElement | Text | null = null;
  public node: vNode = vNode.empty();
  public children: IContext[] = [];

  public static empty(): IContext {
    return new Context();
  }

  public get isEmpty(): boolean {
    return this.node.isEmpty;
  }
}

export function h(
  type: string | ReactLiteConstructor,
  attrs?: INodeAttributes | null,
  ...children: Array<IContext | any>
): IContext {

  if (typeof type === 'string') {
    const context: IContext = new Context();

    context.node = arguments.length === 1
      ? vNode.text(type)
      : new vNode({ type, attrs });

    context.children = children.map(child =>
      child instanceof Context ? child : h(toString(child)));

    return context;
  } else {
    const instance = new type(attrs);
    instance.context = instance.render(h);
    instance.context.instance = instance;

    return instance.context;
  }
}
