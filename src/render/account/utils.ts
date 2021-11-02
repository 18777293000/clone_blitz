

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