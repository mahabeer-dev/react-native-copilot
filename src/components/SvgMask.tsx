import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import type { MaskProps, SvgMaskPathFunction, ValueXY } from "../types";

const AnimatedSvgPath = Animated.createAnimatedComponent(Path);
const windowDimensions = Dimensions.get("window");

const defaultSvgPath: SvgMaskPathFunction = ({
  size,
  position,
  canvasSize,
  borderRadius: br = 0,
}): string => {
  const x = (position.x as any)._value as number;
  const y = (position.y as any)._value as number;
  const w = (size.x as any)._value as number;
  const h = (size.y as any)._value as number;

  const r = Math.max(0, Math.min(br, w / 2, h / 2));

  if (r <= 0) {
    return `M0,0H${canvasSize.x}V${canvasSize.y}H0V0ZM${x},${y}H${x + w}V${y + h}H${x}V${y}Z`;
  }

  return [
    `M0,0H${canvasSize.x}V${canvasSize.y}H0V0Z`,
    `M${x + r},${y}`,
    `H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}`,
    `V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}`,
    `H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}`,
    `V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`,
  ].join("");
};

export const SvgMask = ({
  size,
  position,
  style,
  easing = Easing.linear,
  animationDuration = 300,
  animated,
  backdropColor,
  svgMaskPath = defaultSvgPath,
  borderRadius,
  onClick,
  currentStep,
}: MaskProps) => {
  const [canvasSize, setCanvasSize] = useState<ValueXY>({
    x: windowDimensions.width,
    y: windowDimensions.height,
  });
  const sizeValue = useRef<Animated.ValueXY>(
    new Animated.ValueXY(size)
  ).current;
  const positionValue = useRef<Animated.ValueXY>(
    new Animated.ValueXY(position)
  ).current;
  const maskRef = useRef<any>(null);

  const animationListener = useCallback(() => {
    const d: string = svgMaskPath({
      size: sizeValue,
      position: positionValue,
      canvasSize,
      step: currentStep,
      borderRadius,
    });

    if (maskRef.current) {
      maskRef.current.setNativeProps({ d });
    }
  }, [canvasSize, currentStep, svgMaskPath, positionValue, sizeValue, borderRadius]);

  const animate = useCallback(
    (toSize: ValueXY = size, toPosition: ValueXY = position) => {
      if (animated) {
        Animated.parallel([
          Animated.timing(sizeValue, {
            toValue: toSize,
            duration: animationDuration,
            easing,
            useNativeDriver: false,
          }),
          Animated.timing(positionValue, {
            toValue: toPosition,
            duration: animationDuration,
            easing,
            useNativeDriver: false,
          }),
        ]).start();
      } else {
        sizeValue.setValue(toSize);
        positionValue.setValue(toPosition);
      }
    },
    [
      animated,
      animationDuration,
      easing,
      positionValue,
      position,
      size,
      sizeValue,
    ]
  );

  useEffect(() => {
    const id = positionValue.addListener(animationListener);
    return () => {
      positionValue.removeListener(id);
    };
  }, [animationListener, positionValue]);

  useEffect(() => {
    if (size && position) {
      animate(size, position);
    }
  }, [animate, position, size]);

  const handleLayout = ({
    nativeEvent: {
      layout: { width, height },
    },
  }: LayoutChangeEvent) => {
    setCanvasSize({
      x: width,
      y: height,
    });
  };

  return (
    <View
      style={style}
      onLayout={handleLayout}
      onStartShouldSetResponder={onClick}
    >
      {canvasSize ? (
        <Svg pointerEvents="none" width={canvasSize.x} height={canvasSize.y}>
          <AnimatedSvgPath
            ref={maskRef}
            fill={backdropColor}
            fillRule="evenodd"
            strokeWidth={1}
            d={svgMaskPath({
              size: sizeValue,
              position: positionValue,
              canvasSize,
              step: currentStep,
              borderRadius,
            })}
          />
        </Svg>
      ) : null}
    </View>
  );
};
