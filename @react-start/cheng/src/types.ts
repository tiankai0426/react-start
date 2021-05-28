import { ReactNode } from "react";

export interface SetProp {
  required?: boolean; //默认非必填
  type?: "string" | "number" | "boolean" | "array"; //boolean：默认选项； array：多选；
  inputType?: "select" | "input" | "json"; //默认select
  rows?: number; //if type===input rows行数
  chooseValue?: (string | number)[]; //type 为boolean 或 inputType为input时候不需要
  name?: string;
  element?: ReactNode;
}

interface ISetProps {
  [key: string]: SetProp;
}

export interface IElementItem {
  //展示的组件
  menuElement: ReactNode;
  //set element
  setElement?: ReactNode;
  //真正渲染的组件
  showElement: ReactNode;
  //可设置的属性
  setProps?: ISetProps;
  //props 根据setProps生成的属性
  props?: { [key: string]: any };
  //使用过程中的唯一标识
  id?: string;
  //拖动过程中显示的名称
  name?: string;
  // 不直接显示元素 如：蒙层 默认true
  directShow?: boolean;
}

export interface IOperateElementItem extends IElementItem {
  oid: string;
  //
  elementList?: IOperateElementItem[];
}
