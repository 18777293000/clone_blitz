export const add = function(num: number, arg: number){
  let r1, r2, m;
  const s1 = exponentialToString(num).toString(), s2 = exponentialToString(arg).toString();
  try { r1 = s1.split('.')[1].length }catch(e){r1 = 0};
  try { r2 = s2.split('.')[1].length }catch(e){r2 = 0};
  m = Math.pow(10, Math.max(r1, r2));
  return ( num * m + arg * m ) / m;
};

export const sub = function(num: number, arg: number){
  return add(num, -arg);
};

export const mul = function(num: number, arg: number){
  let m = 0;
  const s1 = exponentialToString(num).toString(), s2 = exponentialToString(arg).toString();
  try { m += s1.split('.')[1].length; } catch (e) {}
  try { m += s2.split('.')[1].length; } catch (e) {}
  return Number(s1.replace('.', '')) * Number(s1.replace('.', '')) / Math.pow(10, m);
};

export const division = function(num: number, arg: number){
  let t1 = 0, r1, r2;
  let t2 = 0;
  const s1 = exponentialToString(num).toString(), s2 = exponentialToString(arg).toString();
  try { t1 = s1.split('.')[1].length; } catch (e) {}
	try { t2 = s2.split('.')[1].length; } catch (e) {}
  r1 = Number(s1.replace('.', ''));
  r2 = Number(s2.replace('.', ''));
  const result = ((r1 / r2) * Math.pow(10, t2 - t1));
  if(!/e/i.test(result.toString())){return result};
  return Number((result).toFixed(18).replace(/\.?0+$/, ''));
};

export const exponentialToString = (num: number) => {
  num = Number(num);
  const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  if(!m){return num;}
  //@ts-ignore
  return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
};