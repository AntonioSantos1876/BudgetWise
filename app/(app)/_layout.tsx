import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

export default function AppLayout() {
  const { session, isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  if (!isLoading && !session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Common glass tab bar style
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView 
              intensity={80} 
              tint={isDark ? 'dark' : 'light'} 
              style={StyleSheet.absoluteFill} 
            />
            <View style={[styles.border, { backgroundColor: colors.glassBorder }]} />
          </View>
        ),
        tabBarActiveTintColor: colors.accentBlue,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="templates" options={{ title: 'Budgets' }} />
      <Tabs.Screen name="goals" options={{ title: 'Goals' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  border: {
    height: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  }
});
