import React from "react";
import { render } from "react-dom";
import { Button } from "../button/button";
import './style.scss';

export enum DialogModel {
  confirm = 'confirm',
  page = 'page',
  minWin = 'minWin',
}

type DialogType = 'warn' | 'info' | 'error';

interface DialogProps {
  className?: string,
  model?: DialogModel,
  type?: DialogType,
  title?: string,
  content?: any,
  okBtn?: string,
  cancelBtn?: string,
  isShowCancel?: boolean,
  isShowOk?: boolean,
  isShowClose?: boolean,
  target?: any,
  isOkAutoClose?: boolean,
  onOpen?: () => void,
  onOk?: () => void,
  onCancel?: () => void,
  onClose?: () => void,
}

export function dialog(config: DialogProps){
  const div = document.createElement('div');
  const ele: HTMLElement = config.target ? config.target : document.body;
  ele.appendChild(div);

  const { onClose = () => {} } = config;
  const ref: any = React.createRef();

  render(
    <Dialog
      ref={ ref }
      className={ config.className }
      model={ config.model }
      type={ config.type }
      title={ config.title }
      content={ config.content }
      okBtn={ config.okBtn }
      cancelBtn={ config.cancelBtn }
      isShowCancel={ config.isShowCancel }
      isShowOk={ config.isShowOk }
			isShowClose = { config.isShowClose}
			isOkAutoClose={ config.isOkAutoClose }
      onCancel={ config.onCancel }
      onOpen={ config.onOpen }
      onClose={ () => {
        onClose();
        try { ele.removeChild(div); } catch(error) {}
      } }
      onOk={ config.onOk }
    ></Dialog>
    ,div
  )
}

interface ConfirmProps {
  content: string | React.ReactNode,
  title: string | React.ReactNode,
  isShowCancel?: boolean;
  isShowOk?: boolean;
  isShowClose?: boolean;
  type?: DialogType;
  cancelBtn?: string;
  okBtn?: string;
  onOk?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

const Confirm = (props: ConfirmProps) => {
  const {
    isShowCancel = true,
		isShowOk = true,
		isShowClose = true,
    title = '',
    content = '',
    cancelBtn = '取消',
    okBtn = '确定',
    onCancel = () => {},
    onOk = () => {},
    onClose = () => {},
  } = props;

  return (
    <div className='bkreact-dialog-content-body'>
      <div className='bkreact-dialog-confirm-wrap'>
        <div className='bkreact-dialog-confirm-content'>
          {
            isShowClose ? (
              <div className="bkreact-dialog-confirm-close" onClick={ () => onClose() }>
                <i className='bkreact-icon-close'></i>
              </div>  
            ) : null
          }
          { title !== '' ? (<div className='bkreact-dialog-title'>{ title }</div>) : null }
          {/*@ts-ignore */}
          {typeof content === 'string' ? <div className="bkreact-dialog-confirm" dangerouslySetInnerHTML={{__html: content}}></div> : <div className="bkreact-dialog-confirm">{content}</div> }
          {
            (isShowCancel || isShowOk) && <div className="bkreact-dialog-btns">
              { isShowCancel ? (<Button size="small" type="default" onClick={ () => onCancel() }>{ cancelBtn }</Button>) : null }
              { isShowOk ? (<Button size="small" type="primary" onClick={ () => onOk() }>{ okBtn }</Button>) : null }
            </div>
          }
        </div>
      </div>
    </div>
  )
}

const Page = (props: any) => {
  const {
		content = '',
    onClose = () => {}
  } = props;
  console.log(2, content);
  return (
    <div className="bkreact-dialog-page">
      <span className="bkreact-dialog-page-close" onClick={() => onClose()}>
				<i className="bkreact-icon-close"></i>
      </span>
      <div className="bkreact-dialog-page-content">
        { content }
      </div>
    </div>
  );
};

interface MinWinProps {
  content: string | React.ReactNode,
  title: string | React.ReactNode,
  isShowClose: boolean,
  onClose?: () => void;
};

const MinWin = (props: MinWinProps) => {
  const {
    isShowClose = true,
    title = '',
    content = '',
    onClose = () => {}
  } = props;
  
  return (
    <div className="bkreact-dialog-content-body">
      <div className="bkreact-dialog-min_win">
        { isShowClose ? (
          <div className="bkreact-dialog-min_win-close"  onClick={() => onClose()}>
            <i className="bkreact-icon-close"></i>
          </div>
        ) : null }
        { title !== '' ? (<div className="bkreact-dialog-title">{ title }</div>) : null }
        <div className="bkreact-dialog-min_win-body">{ content }</div>
      </div>
    </div>
  );
}

export class Dialog extends React.Component<DialogProps>{
  public state = {
    visible: false,
    isShow: true,
  };

  dialogExit(){
    const { onClose = () => {} } = this.props;
    this.setState({ isShow: false });
    onClose();
  };

  ok(){
    const { onOk = () => {}, isOkAutoClose } = this.props;
    isOkAutoClose && this.close();
    onOk();
  };

  close(){
    this.setState({ visible: false });
  };

  cancel(){
    const { onCancel = () => {} } = this.props;
    console.log('running dialog cancel');
    this.close();
    onCancel();
  };

  componentDidMount(){
    this.setState({ visible: true });
  };

  render(){
    const {
      className = '',
      model = 'confirm',
      type = 'warn',
      isShowCancel = true,
      isShowOk = true,
      isShowClose = true,
      title = '',
      content = '',
      cancelBtn = '取消',
			okBtn = '确定',	
      onOpen = () => {},
    } = this.props;
    const modelMap: any = {
                confirm: <Confirm
                  isShowCancel={ isShowCancel }
                  isShowOk={ isShowOk }
                  title={ title }
                  isShowClose={ isShowClose }
                  type={ type }
                  content={ content }
                  cancelBtn={ cancelBtn }
                  okBtn={ okBtn }
                  onCancel={ () => this.cancel() }
                  onClose={ () => this.cancel() }
                  onOk={ () => this.ok() }
                />,
                page: <Page 
                  content={ content }
                  onClose={ this.cancel.bind(this) }
                />,
                minWin: <MinWin content={ content }
                  title={ title }
                  isShowClose={ isShowClose }
                  onClose={ this.cancel.bind(this) }
                />,
    };
    const { visible, isShow } = this.state;

    return isShow ? (
      <div className={ "bkreact-dialog " + className }>
        <div className="bkreact-dialog-bg"></div>
        { modelMap[model] }
      </div>
    ) : null
  }
}