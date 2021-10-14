import { get, post } from "../frame/utils/http";

export const getSymbols = (userid: string = '') => {
  const url = `/proxy/v2/shift/price/m_symbols?userid=${userid}&locale=${document.documentElement.getAttribute('lang') || 'zh'}`;
  return {
    key: url,
    promise: () => get(url),
  }
}

export const getPrice = () => {
  const url = `/proxy/v2/shift/price/m_price`;
  return {
    key: url,
    promise: () => get(url),
  }
}

export const getRates = () => {
  const url = `/proxy/v2/shift/price/m_rate`;
  return {
    key: url,
    promise: () => get(url),
  }
}