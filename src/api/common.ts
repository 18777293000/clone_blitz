import { get } from '../frame/utils/http';

export const getNotices = (status = 1, page = 1, size = 10, lang = 'zh') => {
  const url = `/proxy/v2/system/announcement/m_announcement?status=${status}&page=${page}&size=${size}&locale=${lang}`;
  return {
    key: url,
    promise: () => get(url)
  }
}

// 获取客服连天的ID
export const getCMID = () => {
  const url = `/proxy/v2/chat/user/get_cmid`;

  return {
    key: url,
    promise: () => get(url),
  }
}
