import { INode, INodeAttributes } from './type';

export const vNodeTextType = '__TEXT__';
export const vNodeCommentType = '__COMMENT__';

const vNodeAttributesSet = [
  'key',
  'class',
  'style',
  'on',
];

interface INodeOption {
  type: string;
  attrs?: INodeAttributes | null;
  text?: string;
}

export class vNode implements INode {
  public type: string;
  public attrs: INodeAttributes = {};
  public text: string = '';

  constructor(option: INodeOption) {
    this.type = option.type;
    this.attrs = option.attrs || {};
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

  // private parseChildren(nodes: any[]): vNode[] {
  //   return nodes.map(node => {
  //     if (node instanceof vNode) {
  //       return node
  //     } else if (isNull(node) || isUndefined(node)) {
  //       return vNode.empty()
  //     } else {
  //       return vNode.text(node.toString())
  //     }
  //   })
  // }
}
