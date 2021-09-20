import React from "react";
import { Button } from "antd";
import { ButtonProps } from "antd/es";
import { useHigh, useHighPage, HighConfig } from "@react-start/cheng-high";

export interface HighButtonProps extends ButtonProps, HighConfig {
  iconName?: string;
}

export const HighButton = ({ highConfig, iconName, ...otherProps }: HighButtonProps) => {
  const { getIcon } = useHigh();
  const { getStateValues, sendEvent } = useHighPage();

  return (
    <Button
      {...otherProps}
      icon={iconName ? getIcon(iconName) : otherProps.icon}
      {...getStateValues(highConfig?.receiveStateList)}
      onClick={(e) => {
        if (otherProps.onClick) {
          otherProps.onClick(e);
          return;
        }
        if (highConfig?.onSend && highConfig?.sendEventName) {
          highConfig.onSend({ type: highConfig.sendEventName });
          return;
        }
        if (highConfig?.sendEventName) {
          sendEvent({ type: highConfig.sendEventName });
        }
      }}
    />
  );
};
