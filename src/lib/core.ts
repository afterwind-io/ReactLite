import {
  INode,
  INodeAttributes,
  IContext,
  IReactLite,
  ReactLiteConstructor,
} from './type';
import { vNode } from './vdom';

export class Context implements IContext {
  public instance: IReactLite | null = null;
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
  ...children: Array<INode | any>
): INode {
  if (arguments.length === 1 && typeof type === 'string') {
    return vNode.text(type);
  }
  return new vNode({ type, attrs, children });
}
