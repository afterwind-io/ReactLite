import { INode } from './type';
import { vNodeTextType } from './vdom';

export function createDomElement(node: INode): HTMLElement | Text {
  let el: HTMLElement | Text;

  if (node.type === vNodeTextType) {
    el = document.createTextNode(node.text);
  } else {
    el = document.createElement(node.type);

    Object.entries(node.attrs).forEach(([key, value]) =>
      setAttribute(el as HTMLElement, key, value)
    );
  }

  return el;
}

export function setAttribute(el: HTMLElement, key: string, value: any) {
  switch (key) {
    case 'class':
      return setClass(el, value);
    case 'style':
      return setStyle(el, value);
    case 'on':
      return setEventListener(el, value);
    case 'domAttr':
      return setDomAttribute(el, value);
    default:
      break;
  }
}

function setClass(el: HTMLElement, value: any) {
  if (typeof value === 'string') {
    el.setAttribute('class', value);
  } else {
    // TODO
  }
}

function setStyle(el: HTMLElement, value: any) {
  if (typeof value === 'string') {
    el.setAttribute('style', value);
  } else {
    // TODO
  }
}

function setEventListener(el: HTMLElement, events: { [key: string]: () => void }) {
  Object.entries(events).forEach(([name, handler]) => {
    el.addEventListener(name, handler);
  });
}

function setDomAttribute(el: HTMLElement, attrs: { [key: string]: any }) {
  Object.entries(attrs).forEach(([key, value]) => {
    // @ts-ignore
    // tslint:disable-next-line: triple-equals
    if (el[key] != value) el[key] = value;
  });
}

function removeAttribute(el: HTMLElement, key: string) {
  el.removeAttribute(key);
}

function addChild(el: HTMLElement, child: HTMLElement | Text) {
  el.appendChild(child);
}
