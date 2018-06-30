export interface INode {
  type: string;
  attrs: INodeAttributes;
  text: string;

  isEmpty: boolean;
}

export interface INodeAttributes {
  key?: any;
  class?: { [key: string]: any } | string;
  style?: { [key: string]: any } | string;
  on?: { [key: string]: any };
  domAttr?: { [key: string]: any };
  [key: string]: any;
}

export interface IContext {
  instance: IDoge | null;
  dom: HTMLElement | Text | null;
  node: INode;
  children: IContext[];

  isEmpty: boolean;
}

export type CreateContext = (
  type: string | ReactLiteConstructor,
  attrs?: INodeAttributes | null,
  ...children: Array<IContext | any>
) => IContext;

export interface IDoge<S = any, P = any> {
  state: S;
  prop: P;
  context: IContext;

  setState(commit: object | ((prevState: S, prop: P) => Partial<S>)): void;
  mount(anchor: HTMLElement | string): void;
  render(h: CreateContext): IContext;
}

export type ReactLiteConstructor = new (props?: any, state?: any) => IDoge<any, any>;
