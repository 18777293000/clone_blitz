export function isUndefinedOrNull(obj: any): obj is undefined | null{
  return (isUndefined(obj) || obj === null);
}

export function isUndefined(obj: any): obj is undefined{
  return (typeof obj === 'undefined'); 
}