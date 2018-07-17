import { IDictionary, INode } from './type';

export function createDomElement(node: INode): HTMLElement | Text {
  let el: HTMLElement | Text;

  if (!node.isDom) throw new Error();

  if (node.isText) {
    el = document.createTextNode(node.text);
  } else {
    el = document.createElement(node.type as string);

    updateDomAttributes(el, node.attrs);
  }

  return el;
}

export function updateDomTextContent(el: Text, content: string): Text {
  if (el.textContent !== content) el.textContent = content;
  return el;
}

export function updateDomAttributes(el: HTMLElement, attrs: IDictionary<any>): HTMLElement {
  Object.entries(attrs).forEach(([key, value]) =>
    setAttribute(el as HTMLElement, key, value)
  );
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
      return setDomAttributes(el, value);
    default:
      break;
  }
}

function setClass(el: HTMLElement, value: IDictionary<boolean> | string[] | string) {
  let cls: string;

  if (typeof value === 'string') {
    cls = value;
  } else if (Array.isArray(value)) {
    cls = value.reduce((str, v) => str + v + ' ', '');
  } else {
    cls = Object.keys(value).reduce<string>((str, key) =>
      value[key] ? str.concat(key) : str, '');
  }

  const originClass = el.getAttribute('class');
  if (cls !== originClass) el.setAttribute('class', cls);
}

function setStyle(el: HTMLElement, value: IDictionary<string> | string) {
  const style = typeof value === 'string'
    ? value
    : Object.entries(value).reduce((str, [k, v]) => str + `${k}: ${v};`, '');

  const originStyle = el.getAttribute('style');
  if (style !== originStyle) el.setAttribute('style', style);
}

function setEventListener(el: HTMLElement, events: IDictionary<EventListenerOrEventListenerObject>) {
  // TODO: 可能造成事件监听函数重复绑定
  Object.entries(events).forEach(([name, handler]) => {
    el.addEventListener(name, handler);
  });
}

function setDomAttributes(el: HTMLElement, attrs: IDictionary<any>) {
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
