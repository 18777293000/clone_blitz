/**
* 格式化数字
* @param  {[string | number]} number  [要格式化的数字]
* @param  {[number]} decimals         [保留几位小数]
* @param  {[string]} dec_point        [小数点符号]
* @param  {[string]} thousands_sep    [千分位符号]
* @param  {[string]} roundtag         [舍入参数，默认 'round' 向上取,'floor'向下取,'ceil' 四舍五入]
* @return {[string]} 格式化后的结果
*/
//formatNumber(1253.325, '1.2-8');
export function formatNumber(num: string | number, format?: string): any {
  const value = Number(num);
  if(isNaN(value) || typeof format !== 'string' || format === ''){
    return num;
  }else{
    let lastNum: any;
    num = parseFloat(num+'');
    if(/[0-9](.[0-9](-[0-9]+)?)?/.test(format)){
      const arr = format.split('.');
      if(!arr[1]){
        lastNum = (+num).toFixed(0);
      }else{
        const decimalArr = arr[1].split('-');
        if(!decimalArr[1]){
          lastNum = (+num).toFixed(+decimalArr[0]);
        }else{
          const numArr = (num+'').split('.');
          lastNum = !numArr[1] || numArr[1].length < +decimalArr[0] ? (+num).toFixed(+decimalArr[0]) : numArr[1].length > +decimalArr[1] ? (+num).toFixed(+decimalArr[1]) : num;
        }
      }
    }else {
      lastNum = num;
    }
    return lastNum;
  }
};

type Roundtag = 'round' | 'floor' | 'ceil';

export function toFixedFix(number: string | number, decimals: number, roundtag: Roundtag = 'round'){
  const k = Math.pow(10, decimals);
  //@ts-ignore
  return '' + parseFloat(Math[roundtag](parseFloat((number * k).toFixed(decimals * 2))).toFixed(decimals * 2)) / k;
}