import * as React from 'react';
import { Overlay, IPlacement } from '../overlay/overlay';
import { Option } from './option';
import { Loading } from '../loading/loading';
import './style.scss';

type ITrigger = 'hover' | 'click' | 'focus';

export interface SelectProps{
  width?: string;
  value?: any;
  children?: any;
  loading?: boolean;
  className?: string;
  customOptions?: string;
  isFixed?: boolean;
  trigger?: ITrigger | ITrigger[];
  model?: 'search' | 'normal' | 'dropdown';
	label?: any; // normal 类型才会有
	after?:string;
  onChange?: Function;
  onInput?: Function;
	needArrow?: boolean; // 是否需要下拉箭头
	showValue?:boolean; //选择后展示value值还是默认label
  getContainer?: ((node: HTMLElement) => HTMLElement) | undefined;
}

interface SelectState {
  visible: boolean;
  selection: any | null,
  options: [],
	keyword?: string;
}

export class Select extends React.Component<SelectProps> {
  private _lastSelection:any = null;

  public state: SelectState = {
    visible: false,
    selection: null,
    options: [],
    keyword: ''
  };

  constructor(props: SelectProps) {
    super(props);

    if (this.props.loading) { return; }

    const defaultVal = this.querySelectionByValue(props.value);
    this.state.selection = defaultVal;
  }

  private querySelectionByValue(value: any) {
		const { children } = this.props;
    
    if (typeof children.find !== 'function') { return null; }

    const child = children.find((element: any) => {
      return element.props.item.value === value;
    })

    this._lastSelection = child ? child.props.item : this._lastSelection;

    return this._lastSelection;
  }

  private updateOptions(children: any) {
    const { selection } = this.state;
    const { width } = this.props;

    const items = React.Children.toArray(children).filter((child: any) => {
      return child?.type === Option;
    }).map((child: any, index: number) => {
      const props = Object.assign({}, child.props, {
        key: index,
        style: { width: width || 'auto' },
        isActive: child.props.item.value === selection?.value,
        onClick: this.onOptionClick.bind(this)
      });

      return React.cloneElement(child, props);
    });
    this.setState({ options: items })
  }

  private onOptionClick(item: any) {
    const { onChange = function() {} } = this.props;
    let selection = !item.disabled ? {...this.state.selection, item: item} : {...this.state.selection};
    this._lastSelection = selection;
    this.setState({ visible: false , selection, keyword: '' });
    onChange(item);
  }

  clickHandler() {
    this.setState({ visible: !this.state.visible });
  }

  inputChange(e:any) {
    const { onInput = () => {}} = this.props;
    this.setState({keyword: e.target.value})
    onInput(e.target.value)
  }

  open() {
    this.setState({ visible: true });
  }

  close() {
    try {
      this.setState({ visible: false });
    } catch(error) {}
  }

  loadingComponent () {
    const { needArrow } = this.props;
    return (
      <>
        { <span className="bkreact-select-loading-text">加载中...</span> }
        { needArrow ? <i className="bktrade-icon-drop_dow"></i>:null }
      </>
    );
  }

  selectComponent() {
    const { className = '', showValue = false, after = ''} = this.props;
		const { selection, visible }: SelectState = this.state;

    return (
      <button type="button"
        className={ `bkreact-select bkreact-select-button ${className}` }
        onClick={ this.clickHandler.bind(this) }>
        { selection && showValue ? selection?.value : selection?.label } {after}
        <i className={ `bktrade-icon-drop_dow ${visible ? 'active' : ''}` }></i>
      </button>
    );
  }

  inputComponent () {
    const { keyword, visible, selection }: SelectState = this.state;
    const { needArrow } = this.props;

    return (
      <>
        <input
          className="bkreact-select-input"
          placeholder={ selection?.label || '' }
          value={ keyword }
          onFocus={ () => this.open() }
          onChange={ this.inputChange.bind(this) }
        />
        { needArrow ? <i className={ `bktrade-icon-drop_dow ${visible ? 'active' : ''}` }></i> : null }
        </>
    );
  }

  dropdownComponent() {
    const { visible } = this.state;
    const { label = '', needArrow, className = '' } = this.props;

    return (
      <button type="button"
        className={ `bkreact-select bkreact-select-button ${className}` }
        onClick={ this.clickHandler.bind(this) }>
        { label }
        { needArrow ? <i className={ `bktrade-icon-drop_dow ${visible ? 'active' : ''}` }></i> : null }
      </button>
    );
  }

  componentDidMount() {
    const { loading } = this.props;
    if (loading) { return; }

    this.updateOptions(this.props.children);
  }

  componentDidUpdate(prevProps: SelectProps) {
    const { value, children, loading } = this.props;

    if (loading) { return; }

    if (children !== prevProps.children || prevProps.value !== value) {
      const selection = this.querySelectionByValue(value);

      /* eslint-disable */
      selection && (this.state.selection = selection);

      this.updateOptions(children);
    }
  }

  componentWillUnmount() {
    this.close();
  }
  
  render() {
    const { customOptions = '', className = '', loading = false, model = 'normal', trigger = ['click'], getContainer } = this.props;
    const { visible, options }: SelectState = this.state;

    return loading
      ? (
        <Overlay
          placement={ IPlacement.bottomLeft }
          className={ `bkreact-select-options ${customOptions}` }
          visible={ visible }
          content={ <Option><Loading /></Option> }
          trigger={ trigger }
          onVisibleChange={ visible => this.setState({ visible }) }
          getContainer={ getContainer }
        >
          <div className="bkreact-select">
            <div className="bkreact-select-loading">{ this.loadingComponent() }</div>
          </div>
      </Overlay>
      )
      : (
          <Overlay
            placement={ IPlacement.bottomLeft }
            className={ `bkreact-select-options ${customOptions}` }
            visible={ visible }
            content={ options }
            trigger={ model === 'search' ? ['focus'] : trigger }
            onVisibleChange={ visible => this.setState({ visible }) }
            getContainer={ getContainer }>
            <>
              { model === 'search' && <div className={ `bkreact-select ${className}` }>{ this.inputComponent() }</div> }
              { model === 'normal' && this.selectComponent()}
              { model === 'dropdown' && this.dropdownComponent()}
            </>
          </Overlay>
        );
  }
}
