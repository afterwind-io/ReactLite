export function isNull(value: any): boolean {
  return value == null;
}

export function isUndefined(value: any): boolean {
  return value === undefined;
}

export function deepcopy<T>(source: T): T {
  // TODO
  return JSON.parse(JSON.stringify(source));
}

export function isFunction(o: any): boolean {
  return !!o && ({}).toString.call(o) === '[object Function]';
}

export function toString(value: any): string {
  if (typeof value === 'string') return value;
  return String(value);
}
