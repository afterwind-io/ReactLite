import { INode, INodeAttributes, ReactLiteConstructor } from './type';
import { isNull, isUndefined } from './util';

export const vNodeTextType = '__TEXT__';
export const vNodeCommentType = '__COMMENT__';

const vNodeAttributesSet = [
  'key',
  'class',
  'style',
  'on',
];

interface INodeOption {
  type: string | ReactLiteConstructor;
  attrs?: INodeAttributes | null;
  children?: Array<INode | string | void>;
  text?: string;
}

export class vNode implements INode {
  public type: string | ReactLiteConstructor;
  public attrs: INodeAttributes;
  public children: INode[];
  public text: string;

  constructor(option: INodeOption) {
    this.type = option.type;
    this.attrs = option.attrs || {};
    this.children = this.parseChildren(option.children || []);
    this.text = option.text || '';
  }

  public static empty(): vNode {
    return new vNode({ type: '' });
  }

  public static text(content: string): vNode {
    return new vNode({
      type: vNodeTextType,
      text: content,
    });
  }

  public static comment(content: string): vNode {
    return new vNode({
      type: vNodeCommentType,
      text: content,
    });
  }

  public get isEmpty(): boolean {
    return this.type === '';
  }

  public get isDom(): boolean {
    return typeof this.type === 'string';
  }

  public get isText(): boolean {
    return this.type === vNodeTextType;
  }

  private parseChildren(nodes: any[]): vNode[] {
    return nodes.map(node => {
      if (node instanceof vNode) {
        return node;
      } else if (isNull(node) || isUndefined(node)) {
        return vNode.empty();
      } else {
        return vNode.text(node.toString());
      }
    });
  }
}
