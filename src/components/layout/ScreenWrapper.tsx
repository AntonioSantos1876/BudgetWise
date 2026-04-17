import React from 'react';
import { StyleSheet, SafeAreaView, ViewStyle, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: string[];
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ 
  children, 
  style,
  gradientColors 
}) => {
  const { colors, isDark } = useTheme();

  const defaultGradient = isDark 
    ? ['#0a0520', '#0d1b4b', '#0a1628']
    : ['#f0f4ff', '#eef2ff', '#e0e7ff'];

  return (
    <LinearGradient
      colors={gradientColors || defaultGradient}
      style={styles.container}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={[styles.safeArea, style]}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
