import { get, post } from 'frame/utils/http';
import { createRSA } from 'frame/utils/RSA';

export const getOTCPairs = (lang = 'zh') => {
  const url = `/proxy/v2/otc/index/m_pairs?local=${lang}`;
  return {
    key: url,
    promise: () => get(url),
  };
};