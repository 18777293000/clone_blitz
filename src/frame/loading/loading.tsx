import React from 'react';
import './style.scss';

interface LoadingProps {
  type?: 'image' | 'normal';
}
export class Loading extends React.Component<LoadingProps>{
  render(){
    const { type = 'normal' } = this.props;

    return (
      <span className={ `bkreact-loading bkreact-loading-${type}` }></span>
    )
  }
}