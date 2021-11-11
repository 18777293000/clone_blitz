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
  
}