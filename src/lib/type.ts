export interface IDictionary<V> {
  [key: string]: V;
}

export interface INode {
  type: string | ReactLiteConstructor;
  attrs: INodeAttributes;
  children: INode[];
  text: string;

  isEmpty: boolean;
  isDom: boolean;
  isText: boolean;
}

export interface INodeAttributes extends IDictionary<any> {
  key?: any;
  class?: IDictionary<boolean> | string[] | string;
  style?: IDictionary<any> | string;
  on?: IDictionary<any>;
  domAttr?: IDictionary<any>;
}

export interface IContext {
  instance: IReactLite | null;
  dom: HTMLElement | Text | null;
  node: INode;
  children: IContext[];

  isEmpty: boolean;
}

export type CreateElement = (
  type: string | ReactLiteConstructor,
  attrs?: INodeAttributes | null,
  ...children: Array<IContext | any>
) => INode;

export interface IReactLite<S = any, P = any> {
  state: S;
  prop: P;
  context: IContext;
  subContext: IContext;

  setState(commit: object | ((prevState: S, prop: P) => Partial<S>)): void;
  render(h: CreateElement): INode;
}

export type ReactLiteConstructor = new (props?: any, childNodes?: INode[]) => IReactLite<any, any>;
