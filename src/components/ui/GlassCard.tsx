import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, intensity = 50 }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <BlurView 
        intensity={intensity} 
        tint={isDark ? 'dark' : 'light'} 
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[colors.glassFill, 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.specular, { backgroundColor: colors.glassSpecular }]} />
      <View style={[styles.border, { borderColor: colors.glassBorder }]} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  specular: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.5,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 24,
    pointerEvents: 'none',
  },
  content: {
    padding: 20,
    zIndex: 1,
  },
});
