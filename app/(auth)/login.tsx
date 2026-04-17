import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassButton } from '../../src/components/ui/GlassButton';
import { useTheme } from '../../src/context/ThemeContext';
import { Logo } from '../../src/components/ui/Logo';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
      setLoading(false);
    } else {
      router.replace('/(app)/dashboard');
    }
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Logo size={100} style={{ marginBottom: 10 }} />
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your money, made clear.</Text>
        </View>

        <GlassCard intensity={80} style={styles.card}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.glassBorder, backgroundColor: colors.glassFill }]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.glassBorder, backgroundColor: colors.glassFill }]}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <GlassButton 
            title={loading ? "Signing in..." : "Sign In"} 
            onPress={handleLogin} 
            disabled={loading}
            style={styles.button}
          />
          
          <Link href="/(auth)/register" style={styles.link}>
            <Text style={[styles.linkText, { color: colors.accentBlue }]}>Don't have an account? Register</Text>
          </Link>
        </GlassCard>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    padding: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 20,
  },
  link: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    fontSize: 14,
    textAlign: 'center',
  }
});
