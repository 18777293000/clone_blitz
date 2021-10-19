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

  return (
    <div className="bktrade-global_seting">
      {/* <Form>
        123
      </Form> */}
      1232
    </div>
  )
};