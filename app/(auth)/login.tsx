import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';

export default function LoginScreen() {
  return (
    <ScreenWrapper style={styles.container}>
      <Text style={styles.text}>Login Screen placeholder</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  }
});
