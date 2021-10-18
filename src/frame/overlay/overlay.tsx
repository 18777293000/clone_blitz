import React from "react";
import RCTooltip from 'rc-tooltip';
import './style.scss';

export enum IPlacement {
  bottomLeft = 'bottomLeft',
  bottomRight = 'bottomRight',
  topLeft = 'topLeft',
  topRight = 'topRight',
}
export type ITrigger = 'hover' | 'click' | 'focus';

interface OverlayProps {
  trigger?: ITrigger[] | ITrigger,
  placement?: IPlacement,
  visible?: boolean,
  className?: string,
  content?: any,
  children?: any,
  getContainer?: (node: HTMLElement) => HTMLElement;
  onVisibleChange?: ((visible: boolean) => void) | undefined;
}

export interface OverlayOptionProps {
  label: string,
  value: any,
  isActive?: boolean,
  children?: any,
  onClick?: Function,
}

export const Overlay = ({
  trigger = ['hover'],
  visible = false,
  children,
  placement = IPlacement.bottomLeft,
  content,
  className='',
  getContainer,
  onVisibleChange,
}: OverlayProps) => {

  return (
    <RCTooltip
      //@ts-ignore
      transitionName={ {
        enter: 'enter',
        enterActive: 'appear-active',
        leave: 'leave',
        leaveActive: 'leave-active',
        appear: 'appear',
        appearActive: 'appear-acctive'
      } }
      prefixCls='bkreact-overlay'
      overlayClassName={ className }
      visible={ visible }
      overlay={ content }
      trigger={ trigger }
      placement={ placement }
      destroyTooltipOnHide={ true }
      getTooltipContainer={ getContainer }
      onVisibleChange={ onVisibleChange }
    >
      <span className='bkreact-overlay-child'>{ children }</span>
    </RCTooltip>
  )
}

export const OverlayOption = (props: OverlayOptionProps) => {
  const { label, value, children, onClick = () => {}, isActive } = props;
  return (
    <div className={ isActive ? 'bkreact-overlay-option active' : 'bkreact-overlay-option' } onClick={ () => onClick({ label, value }) }>
      { children }
    </div>
  )
}