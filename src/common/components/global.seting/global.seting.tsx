import React, { useRef } from "react";
import { useObservable } from "rxjs-hooks";
import { Select } from "../../../frame/select";
import { Option } from '../../../frame/select/option';
import { globalConfigerviceFactory } from "../../../services/global/config";
import { I18nServiceFactory } from "../../services/i18n";
import { FormItem, Form } from "../../../frame/form";
import './style.scss';

interface globalSetingProps {
  onClose?: Function;
}
export default ({onClose = () => {}}: globalSetingProps) => {
  const globalConfigervice = useRef(globalConfigerviceFactory());
  const i18nService = useRef(I18nServiceFactory());

  const current = useObservable(() => globalConfigervice.current.currency$);
  const lang = useObservable(() => globalConfigervice.current.lang$) || '';
  const I18n = i18nService.current.getI18n('home', lang);
  console.log('globalseting', lang);

  return (
    <div className="bktrade-global_seting">
      <Form>
        <FormItem label={ "语言" }>
          <Select
            customOptions='bktrade-global_seting-options'
            value = { lang }
            onChange = { (select: any) => { globalConfigervice.current.lang = select.value; onClose() } }
          >
            <Option item={{ label: '简体中文', value: 'zh' }}>简体中文</Option>
            <Option item={{ label: 'English', value: 'en' }}>English</Option>
          </Select>
        </FormItem>
      </Form>
    </div>
  )
};