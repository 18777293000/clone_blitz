export function throttle(times = 200) {
  let isRun = false;
  return function(tag: any, name: any, descriptor: any){
    const func = descriptor.value;
    descriptor.value = function(...args: any){
      if(isRun){return};
      isRun = true;
      try{
        func.apply(this, args);
      }catch(error){
        console.log(error);
      }
      setTimeout(() => {
        isRun = false;
      }, times);
    }
  }
}