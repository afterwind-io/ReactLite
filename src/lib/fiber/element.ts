import {
  IDictionary,
  IElement,
  ElementType,
  ReactConstuctor,
} from './type';

function createElement(
  type: string | ReactConstuctor,
  prop: IDictionary | null,
  ...children: Array<string | IElement>
): IElement {
  const elements = children.map(child => typeof child === 'string' ? createTextElement(child) : child);

  return {
    type,
    prop: {
      ...prop,
      children: elements,
    }
  };
}

function createTextElement(content: string): IElement {
  return {
    type: ElementType.TEXT,
    prop: {
      textContent: content
    },
  };
}

export {
  createElement
};
