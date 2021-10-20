import * as React from 'react';

export interface OptionProps{
	item?: any;
	className?:string;
  children?: any;
  isActive?: boolean;
  isSplitLine?: boolean;
  disabled?: boolean;
  onClick?: (tab: any) => void;
  style?: any;
}
export class Option extends React.Component<OptionProps> {
  render() {
		const { item, isActive = false, disabled = false, children, onClick = function() {}, isSplitLine = false, className = '',style } = this.props;
		const styleObj = {style} || {}
    return (
      <div onClick={ () => !disabled && onClick(item) }
        {...styleObj}
        className={ `bkreact-select-option ${className} ${isActive ? 'active' : ''} ${isSplitLine ?'bkreact-select-option-split_line' : ''} ${disabled ? 'bkreact-select-option-disabled' : ''}` }>
        { children }
      </div>
    );
  }
}
