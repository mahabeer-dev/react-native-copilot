import React, { useEffect, useMemo, useRef } from "react";
import { type NativeMethods } from "react-native";

import { useCopilot } from "../contexts/CopilotProvider";

interface Props {
  name: string;
  order: number;
  text: string;
  children: React.ReactElement<any>;
  active?: boolean;
  deleted?: boolean;
  maskRadius?: number;
}

export const CopilotStep = ({
  name,
  order,
  text,
  children,
  active = true,
  deleted = false,
  maskRadius = 0,
}: Props) => {
  const shouldRegister = active && !deleted;
  const registeredName = useRef<string | null>(null);
  const { registerStep, unregisterStep } = useCopilot();
  const wrapperRef = React.useRef<NativeMethods | null>(null);

  const measure = async () => {
    return await new Promise<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>((resolve) => {
      const measure = () => {
        // Wait until the wrapper element appears
        if (wrapperRef.current != null && "measure" in wrapperRef.current) {
          wrapperRef.current.measure((_ox, _oy, width, height, x, y) => {
            resolve({
              x,
              y,
              width,
              height,
            });
          });
        } else {
          requestAnimationFrame(measure);
        }
      };

      measure();
    });
  };

  useEffect(() => {
    if (shouldRegister) {
      if (registeredName.current && registeredName.current !== name) {
        unregisterStep(registeredName.current);
      }
      registerStep({
        name,
        text,
        order,
        measure,
        wrapperRef,
        visible: true,
        maskRadius,
      });
      registeredName.current = name;
    } else if (registeredName.current) {
      unregisterStep(registeredName.current);
      registeredName.current = null;
    }
  }, [name, order, text, registerStep, unregisterStep, shouldRegister, maskRadius]);

  useEffect(() => {
    if (shouldRegister) {
      return () => {
        if (registeredName.current) {
          unregisterStep(registeredName.current);
        }
      };
    }
  }, [name, unregisterStep, shouldRegister]);

  const copilotProps = useMemo(
    () => ({
      ref: wrapperRef,
      onLayout: () => {}, // Android hack
    }),
    [],
  );

  return React.cloneElement(children, { copilot: copilotProps });
};
