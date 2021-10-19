//@ts-ignore
export function isType(val: any, type: any){
  return Object.prototype.toString.call(val) === '[object ' + type + ']';
}
export function isObject(val: any){
  return isType(val, 'Object');
}
export function isArray(val: any){
  return isType(val, 'Array');
}
export function isString(val: any){
  return isType(val, 'String');
}
export function isNumber(val: any) {
  return isType(val, 'Number');
}
export function isNil(val: any) {
  return (isType(val, 'Null') || isType(val, 'Undefined'));
}
export const toArray = function(list: any[]){
  const arr = [];
  for(let i = 0, length = list.length; i < length; i++){
    arr.push(list[i]);
  };
  return arr;
}

//null undefined [] {} ''
export function isEmpty(val: any){
  if(isNil(val)){
    return true;
  }
  if(isArray(val)){
    return val.length <= 0;
  }
  if(isString(val)){
    return val.replace(/\s/g, '') === '';
  }
  if(isObject(val)){
    return Object.keys(val).length <= 0;
  }
}