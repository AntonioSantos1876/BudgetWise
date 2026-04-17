import React from 'react';
import { View, Image, StyleSheet, Text, ViewStyle, ImageStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LogoProps {
  size?: number;
  showText?: boolean;
  style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({ size = 60, showText = true, style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Image 
        source={require('../../../assets/logo.png')} 
        style={[styles.image, { width: size, height: size }] as ImageStyle}
        resizeMode="contain"
      />
      {showText && (
        <Text style={[styles.text, { color: colors.textPrimary, fontSize: size * 0.4 }]}>
          Budget<Text style={{ color: colors.accentBlue }}>Wise</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    marginRight: 8,
  },
  text: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
