import { IDictionary, IElement } from './type';
import { createElement as h } from './element';

function dom(type: string) {
  return (attrs: IDictionary | null, ...children: Array<string | IElement>): IElement => {
    return h(type, attrs, ...children);
  };
}

export const button = dom('button');
export const div = dom('div');
export const h1 = dom('h1');
export const h2 = dom('h2');
export const h3 = dom('h3');
export const h4 = dom('h4');
export const h5 = dom('h5');
export const h6 = dom('h6');
export const input = dom('input');
export const p = dom('p');
export const span = dom('span');
export const table = dom('table');
export const td = dom('td');
export const th = dom('th');
export const tr = dom('tr');
