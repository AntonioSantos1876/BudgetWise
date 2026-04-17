import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  percentage: number;
  radius: number;
  strokeWidth: number;
  color: string;
  backgroundColor: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  radius,
  strokeWidth,
  color,
  backgroundColor,
  children
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const halfCircle = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const maxPerc = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (circumference * maxPerc) / 100;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: strokeDashoffset,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [percentage]);

  return (
    <View style={{ width: halfCircle * 2, height: halfCircle * 2 }}>
      <Svg height="100%" width="100%" viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}>
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={animatedValue}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.centerElement]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerElement: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
