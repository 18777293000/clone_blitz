import React from "react";
import { Loading } from "../loading/loading";
import './style.scss'

export interface ButtonProps {
  type?: 'default' | 'text' | 'line' | 'primary' | 'green' | 'red';
  size?: 'normal' | 'small' | 'lg' | 'xs';
  isBlock?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: Function;
  className?: string;
  children: any;
}

export class Button extends React.Component<ButtonProps> {
  createClass(): string {
    const {
      className = '',
      type = 'default',
      size = 'normal',
      isBlock = false,
    } = this.props;

    return `${className} bkreact-button bkreact-button-${type} bkreact-button-${size} ${isBlock ? 'bkreact-button-block' : ''}`;
  }

  render(){
    const { disabled, children, loading = false } = this.props;
    const className = this.createClass();
    const { onClick = () => {} } = this.props;

    return (
      <button type='button' disabled={ disabled || loading } className={ className } onClick={(event) => onClick(event)}>
        <span style={ loading ? { visibility: 'hidden' } : {} }>{ children }</span>
        { loading && <span className='bkreact-button-loading'><Loading type="image" /></span> }
      </button>
    )
  }

}