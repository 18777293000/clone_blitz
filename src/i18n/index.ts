import * as en from './en';
import * as zh from './zh';

//@ts-ignore
window['en'] = en;
//@ts-ignore
window['zh'] = zh;

export const i18n = function(lang: 'zh' | 'en' | ''){
  //@ts-ignore
  return window[lang];
}

export const i18nTool = function(input: any[], vars = {}){
  if(!input){return ''};

  const tokens: any = [];
  let isStart:boolean = false;
  let varname:string = '';

  for(let i = 0; i < input.length; i++){
    let currentChar = input[i];
    let nextChar = input[i + 1];
    if(currentChar === '{' && nextChar === '{'){
      isStart = true;
      i = i + 1;
    }else if(currentChar === '}' && nextChar === '}'){
      isStart = false;
      i = i + 1;
      tokens.push({
        name: 'variable',
        value: varname,
      });
      varname = '';
    }else if(isStart){
      varname += currentChar;
    }else{
      tokens.push({
        name: 'string',
        value: currentChar,
      })
    }
  }

  let result = '';
  for(let i = 0; i < tokens.length; i++){
    const token = tokens[i];
    if(token.name === 'string'){
      result += tokens.value;
    }else if(token.name === 'variable'){
      //@ts-ignore
      result += vars[token.value] || ''
    }
  }
  return result;
}