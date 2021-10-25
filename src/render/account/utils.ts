

export const formatRules = (rules: any, I18n: any) => {
  if(!rules || !rules.length){return []};
  return rules.map((rule: any) => {
    rule.msg = I18n[rule.msg] || rule.msg;
    return rule;
  })
}