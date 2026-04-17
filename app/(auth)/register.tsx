import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassButton } from '../../src/components/ui/GlassButton';
import { useTheme } from '../../src/context/ThemeContext';
import { CURRENCIES } from '../../src/constants/currencies';

const AVATARS = ['💰', '🤑', '💎', '🚀', '🧠', '💼', '💳', '🏦', '💹', '🌴'];

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('💰');
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');
  const [secondaryCurrency, setSecondaryCurrency] = useState('JMD');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  const handleNext = () => {
    if (step === 1 && (!email || !password)) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    if (step === 2 && !displayName) {
      Alert.alert('Error', 'Display name is required');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleRegister = async () => {
    setLoading(true);
    
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        }
      }
    });

    if (authError) {
      Alert.alert('Registration Failed', authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. The profile is auto-created by our trigger, but we need to update it with the extra fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar,
          primary_currency: primaryCurrency,
          secondary_currency: secondaryCurrency,
          monthly_income: parseFloat(monthlyIncome) || 0,
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }

    // Success, router will redirect based on AuthContext state automatically
    setLoading(false);
    router.replace('/(app)/dashboard');
  };

  const renderStepIndicators = () => {
    return (
      <View style={styles.indicatorContainer}>
        {[1, 2, 3, 4].map((i) => (
          <View 
            key={i} 
            style={[
              styles.indicator, 
              { backgroundColor: i <= step ? colors.accentViolet : colors.glassBorder }
            ]} 
          />
        ))}
      </View>
    );
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === 1 && "Start your journey"}
            {step === 2 && "Personalize your profile"}
            {step === 3 && "Set your currencies"}
            {step === 4 && "Almost done!"}
          </Text>
        </View>

        {renderStepIndicators()}

        <GlassCard intensity={80} style={styles.card}>
          {step === 1 && (
            <View>
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
                placeholder="Password (min 6 chars)"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          )}

          {step === 2 && (
            <View>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.glassBorder, backgroundColor: colors.glassFill }]}
                placeholder="Display Name"
                placeholderTextColor={colors.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
              />
              <Text style={[styles.label, { color: colors.textSecondary }]}>Choose Avatar:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
                {AVATARS.map((emoji) => (
                  <TouchableOpacity 
                    key={emoji} 
                    onPress={() => setAvatar(emoji)}
                    style={[
                      styles.avatarBtn, 
                      avatar === emoji && { backgroundColor: colors.glassSpecular, borderColor: colors.accentBlue, borderWidth: 1 }
                    ]}
                  >
                    <Text style={styles.avatarEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Primary Currency:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
                {CURRENCIES.slice(0, 10).map((curr) => (
                  <TouchableOpacity 
                    key={curr} 
                    onPress={() => setPrimaryCurrency(curr)}
                    style={[
                      styles.currencyBtn, 
                      primaryCurrency === curr && { backgroundColor: colors.accentViolet }
                    ]}
                  >
                    <Text style={[styles.currencyText, { color: colors.textPrimary }]}>{curr}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 10 }]}>Secondary Currency:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
                {CURRENCIES.slice(0, 10).map((curr) => (
                  <TouchableOpacity 
                    key={curr} 
                    onPress={() => setSecondaryCurrency(curr)}
                    style={[
                      styles.currencyBtn, 
                      secondaryCurrency === curr && { backgroundColor: colors.accentBlue }
                    ]}
                  >
                    <Text style={[styles.currencyText, { color: colors.textPrimary }]}>{curr}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {step === 4 && (
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Estimated Monthly Income ({primaryCurrency}):</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.glassBorder, backgroundColor: colors.glassFill }]}
                placeholder="e.g. 5000"
                placeholderTextColor={colors.textSecondary}
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                keyboardType="numeric"
              />
              <Text style={[styles.helperText, { color: colors.textMuted }]}>
                (Optional) Helps with budget templates later.
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            {step > 1 && (
              <GlassButton 
                title="Back" 
                onPress={handleBack} 
                style={[styles.actionBtn, { flex: 1, marginRight: 10, backgroundColor: 'transparent' }]}
                textStyle={{ color: colors.textSecondary }}
              />
            )}
            
            {step < 4 ? (
              <GlassButton 
                title="Next" 
                onPress={handleNext} 
                style={[styles.actionBtn, { flex: step === 1 ? 1 : 2 }]}
              />
            ) : (
              <GlassButton 
                title={loading ? "Registering..." : "Complete Setup"} 
                onPress={handleRegister} 
                disabled={loading}
                style={[styles.actionBtn, { flex: 2 }]}
              />
            )}
          </View>
          
          {step === 1 && (
            <Link href="/(auth)/login" style={styles.link}>
              <Text style={[styles.linkText, { color: colors.textSecondary }]}>Already have an account? <Text style={{ color: colors.accentBlue }}>Login</Text></Text>
            </Link>
          )}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 8,
  },
  indicator: {
    height: 6,
    width: 24,
    borderRadius: 3,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  avatarScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  currencyScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  currencyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 16,
  },
  actionBtn: {
    paddingVertical: 14,
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
