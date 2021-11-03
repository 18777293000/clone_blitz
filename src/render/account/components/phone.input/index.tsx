import React, { useState, useEffect } from "react";
import { Input } from "frame/input/input";
import { Select, Option } from "frame/select";
import { countriesSim } from "common/utils/countriesSim";
import { isPhoneNum, useInitCountry } from "render/account/utils";
import './style.scss';

const formatCountries = (countries: any) => {
  return countries.map((item: any) => {
    return {
      value: item.value,
      label: item.code,
      name: item.label,
    }
  });
};

const newCountries = formatCountries(countriesSim);

interface CountryOption {
  value: string;
  label: string;
  name: string;
};

export const CountrySelect = ({onChange =()=>{}}: {onChange?:(key:string, value:string)=>void }) => {
  const initCountry: CountryOption | null = useInitCountry(newCountries);
  const [ activeCountry, activeCountrySet ] = useState<CountryOption>({value: "SG", label: "+65", name: "Singapore (Singapura) (新加坡共和国)"});
  const [ countries, countriesSet ] = useState(newCountries);

  useEffect(() => {

    if(!initCountry){return};

    activeCountrySet(initCountry);

    //@ts-ignore
    onChange('areaCode', initCountry.label);

    //@ts-ignore
    onChange('countryCode', initCountry.value);
    /**eslint-disable */
  }, [initCountry]);

  const change = (country: CountryOption) => {
    activeCountrySet(country);
    onChange('areaCode', country.label);
    onChange('countryCode', country.value);
  };

  const searchCountry = (keyword: string)=>{
    const countries = keyword ? newCountries.filter((item: any) => {
      return (item.label.toUpperCase() + item.name.toUpperCase() + item.value.tpUpperCase()).indexOf(keyword.toUpperCase()) >= 0;
    }) : newCountries;
    countriesSet(countries);
  };

  return (
    <Select
      model='search'
      value={activeCountry.value}
      customOptions=''
      onInput={(keyword: string)=> searchCountry(keyword)}
      onChange={(item: any) => change(item)}
      needArrow={true}
    >
      {
        countries.map((item: any, index: number) => <Option key={index} item={item}>{ item.label } { item.name }</Option>)
      }
    </Select>
  )
};

interface PhoneInputProps {
  placeholder?: string;
  onEnter?: Function;
  onChange?: Function;
  onStateChange?: Function;
}

// magnet:?xt=urn:btih:dc667ad34e5b5b037cedd8a99097aa1e24de7a47&dn=%e9%98%b3%e5%85%89%e7%94%b5%e5%bd%b1www.ygdy8.com.%e5%b3%b0%e7%88%86.2021.HD.1080P.%e5%9b%bd%e8%af%ad%e4%b8%ad%e5%ad%97.mkv&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce&tr=udp%3a%2f%2fexodus.desync.com%3a6969%2fannounce
export default (props: PhoneInputProps) => {
  const {
		placeholder = '请输入手机号',
    onEnter = () => {},
		onChange = () => {},
		onStateChange= ()=> {}
	} = props;
	const [phoneNumber, phoneNumberSet] = useState('');
	const [countryCode, countryCodeSet] = useState('SG');

  const change = (key: string, set: Function, value: any) => {
    set(value);
    onChange(key, value);
    onStateChange(isPhoneNum(key === 'phoneNumber' ? countryCode: value, key === 'phoneNumber' ? value : phoneNumber));
  };

  return (
    <Input
      className=''
      size='normal'
      type='number'
      placeholder={placeholder}
      value={phoneNumber}
      after={ '选择国家' }
      onEnter={ ()=> onEnter() }
      onChange={(value: any) => change('phoneNumber', phoneNumberSet, value)}
    ></Input>
  )
}