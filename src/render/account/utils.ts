import { useEffect, useState } from "react";
import { getIpInfo } from "api/account";
import { isValidNumber } from "libphonenumber-js";

export const formatRules = (rules: any, I18n: any) => {
  if(!rules || !rules.length){return []};
  return rules.map((rule: any) => {
    rule.msg = I18n[rule.msg] || rule.msg;
    return rule;
  })
};

export const isEmail = (val: string) => {
  const reg = /^[A-Za-z0-9]+([._\\-]*[A-Za-z0-9])*@([A-Za-z0-9]+[-A-Za-z0-9]*[A-Za-z0-9]+.){1,63}[A-Za-z0-9]+$/;
  return reg.test(val);
};

export const useInitCountry = (countries: any) => {
  const [ activeCountry, activeCountrySet ] = useState(null);

  useEffect(() => {
    getIpInfo().promise().then(data => {
      if(!data || !data.country_code || data.country_code === ''){
        data.code = 'SG';
        data.name = 'Singapore';
      };

      countries.forEach((country: any) => {
        if(country.value === data.country_code){
          activeCountrySet(country);
          return;
        }
      })
    }).catch(error => {
      const data: any = {};
      if(error.country_code){
        data.country_code = error.country_code;
        data.name = error.country_name;
      }else{
        data.country_code = 'SG';
        data.name = 'Singapore';
      }

      countries.forEach((country: any) => {
        if(country.value === data.country_code){
          activeCountrySet(country);
          return;
        }
      })
    })
  }, [countries]);

  return activeCountry;
};

export const isPhoneNum = (countryCode: string, phone: string) => {
  if (!phone || !countryCode) {
    return false;
  };
  if(countryCode === 'CN'){
    return /^1\d{10}$/.test(phone);
  };
  //@ts-ignore
  return isValidNumber(phone, countryCode);
};