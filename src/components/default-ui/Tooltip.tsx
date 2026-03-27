import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "./Button";

import { styles } from "../style";

import type { TooltipProps } from "../../types";
import { useCopilot } from "../../contexts/CopilotProvider";

export const Tooltip = ({ labels, labelButtonStyle = {} }: TooltipProps) => {
  const { goToNext, goToPrev, stop, currentStep, isFirstStep, isLastStep } =
    useCopilot();

  const handleStop = () => {
    void stop();
  };
  const handleNext = () => {
    void goToNext();
  };

  const handlePrev = () => {
    void goToPrev();
  };

  return (
    <View>
      <View style={styles.tooltipContainer}>
        <Text testID="stepDescription" style={styles.tooltipText}>
          {currentStep?.text}
        </Text>
      </View>
      <View style={[styles.bottomBar]}>
        {!isLastStep ? (
          <TouchableOpacity onPress={handleStop}>
            <Button style={[labelButtonStyle]}>{labels.skip}</Button>
          </TouchableOpacity>
        ) : null}
        {!isFirstStep ? (
          <TouchableOpacity onPress={handlePrev}>
            <Button style={[labelButtonStyle]}>{labels.previous}</Button>
          </TouchableOpacity>
        ) : null}
        {!isLastStep ? (
          <TouchableOpacity onPress={handleNext}>
            <Button style={[labelButtonStyle]}>{labels.next}</Button>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleStop}>
            <Button style={[labelButtonStyle]}>{labels.finish}</Button>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
