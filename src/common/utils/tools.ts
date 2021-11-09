

export const depthCopy = (obj: Object) => {
  return JSON.parse(JSON.stringify(obj));
};