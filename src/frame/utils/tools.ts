export const getOSInfo = () => {
  const agent = navigator.userAgent.toLowerCase();
  let osVersion;
  if(agent.indexOf('window nt') > 0){
    const version = agent.substr(agent.indexOf('window nt ') + 11,4);
    switch(version){
      case '5.1':
        osVersion = 'window xp';
        break;
      case '6.1':
        osVersion = 'window 7';
        break;
      case '6.3':
        osVersion = 'window 8';
        break;
      case '10.0':
        osVersion = 'window 10';
        break;

      default:
        osVersion = '其他';
    }
    return osVersion;
  };
  if(agent.indexOf('mac') > 0){
    const version = agent.toLowerCase().substr(agent.indexOf('mac os x') + 9,9);
    const index = [version.indexOf(' '), version.indexOf(")", version.indexOf(";"))];
    for(let i = 0; i< index.length; i++){
      if(index[i] > 0){
        return 'Mac OS X ' + version.substring(0, index[i] - 1);
      }
    }
  };
  return '--';
}

export const getBrowserInfo = () => {
  const agent: any = navigator.userAgent.toLowerCase();
  const regStr_ie         = /msie [\d.]+;/gi;
  const regStr_rv         = /rv:(\d+\.\d+)/i;
  const regStr_ff         = /firefox\/[\d.]+/gi;
  const regStr_chrome     = /chrome\/[\d.]+/gi;
  const regStr_safVersion = /version\/[\d.]+/gi;
  const regStr_opera      = /Opera\/[\d.]+/gi;
  if (agent.indexOf('msie') > 0) {
    return agent.match(regStr_ie)[0];
  }
  if (agent.indexOf('rv:') > 0) {
    return 'MSIE ' + agent.match(regStr_rv)[1];
  }
  if (agent.indexOf('chrome') > 0) {
    return agent.match(regStr_chrome)[0];
  }
  if (agent.indexOf('firefox') > 0) {
    return agent.match(regStr_ff)[0];
  }
  if (agent.indexOf('safari') > 0 && agent.indexOf('chrome') < 0) {
    return 'safari' + agent.match(regStr_safVersion)[0];
  }
  if (agent.indexOf('opera') > 0) {
    return agent.match(regStr_opera)[0];
  }
  return '--';
};

export function toThousands(num: any){
  if(isNaN(Number(num))){return ''};
  const Symbol = +num < 0 ? '-' : '';
  let counter = 0;
  const nums = +num < 0 ? num.toString().split('-')[1].split('.') : num.toString().split('.');
  const result: any = [];
  const numStrs = (nums[0] || 0).toString().split('');
  console.log('len', numStrs);
  for(let i = numStrs.length - 1; i >=0; i--){
    counter++;
    result.unshift(numStrs[i]);
    if(!(counter % 3) && i !== 0){
      result.unshift(',');
    }
    console.log(result);
  }
  nums[0] = result.join('');
  const str = nums[1] ? (nums[0] + '.' + nums[1]) : nums[0];
  return Symbol + str;
};

export function computPrecision(num: number): number{
  if(+num === 0){
    return 2;
  }

  if(num <= 0.000001){
    return 10;
  }else if(num <= 0.0001){
    return 8;
  }else if(num <= 0.01){
    return 6;
  }else if(num <= 1){
    return 4
  }else if(num > 100000){
    return 0
  }else {
    return 2
  }
}

export const computedData = function(day: number, offset: number){
  const nowTime = new Date();
  const endTime = new Date(`${nowTime.getFullYear()}/${nowTime.getMonth() + 1}/${nowTime.getDate()} 23:59:59`)
  const timeStr = endTime.getTime() - day * 24 * 60 * 60 * 1000 + offset;
  const startTime = new Date(timeStr);

  return {
    y: startTime.getFullYear(),
    m: startTime.getMonth() + 1,
    d: startTime.getDate(),
  }
};

export function currencyToSymbol(currency: string){
  const symbolMap = {
    CNY: '¥',
    USD: '$',
    BTC: '฿',
    LTC: 'L',
    DOG: 'D',
    BTS: 'S',
    YUN: 'Y',
    USDT: '₮',
    ETH: 'E',
    JPY: 'JPY¥',
    EUR: '€',
    GBP: '£',
    KRW: '₩',
    BRL: 'R$',
    AUD: 'AUD',
    BCH: 'BCH',
    QC: 'QC',
  };
  // @ts-ignore
  return symbolMap[currency] || ''
};