import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassButton } from '../../src/components/ui/GlassButton';
import { supabase } from '../../src/lib/supabase';
import { LogOut, User, Moon, Sun, Settings as SettingsIcon } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDark, setTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive',
        onPress: async () => {
          await signOut();
        } 
      }
    ]);
  };

  const handleExportData = () => {
    // Already implemented in History! We can re-use or just point them there.
    Alert.alert('Export Data', 'You can export your transactions to CSV directly from the History tab.');
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}>
            <Text style={styles.avatarEmoji}>{profile?.avatar || '👤'}</Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{profile?.display_name || 'User'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
        
        <GlassCard intensity={40} style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconText}>
              {isDark ? <Moon color={colors.textPrimary} size={20} /> : <Sun color={colors.textPrimary} size={20} />}
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>Dark Mode</Text>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')} 
              trackColor={{ false: colors.glassBorder, true: colors.accentViolet }}
              thumbColor={isDark ? '#fff' : '#f4f3f4'}
            />
          </View>
        </GlassCard>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Currencies</Text>
        <GlassCard intensity={40} style={styles.settingCard}>
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 16, marginBottom: 16 }]}>
            <View>
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>Primary Currency</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Used as your base for budgets and goals.</Text>
            </View>
            <Text style={{ color: colors.accentBlue, fontWeight: 'bold' }}>{profile?.primary_currency}</Text>
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingText, { color: colors.textPrimary }]}>Secondary Currency</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Displayed alongside net balance.</Text>
            </View>
            <Text style={{ color: colors.accentEmerald, fontWeight: 'bold' }}>{profile?.secondary_currency}</Text>
          </View>
        </GlassCard>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data</Text>
        <GlassCard intensity={40} style={styles.settingCard}>
          <TouchableOpacity style={styles.settingRow} onPress={handleExportData}>
            <Text style={[styles.settingText, { color: colors.textPrimary }]}>Export Data (CSV)</Text>
            <Text style={{ color: colors.textSecondary }}>→</Text>
          </TouchableOpacity>
        </GlassCard>

        <GlassButton 
          title="Sign Out" 
          onPress={handleSignOut} 
          style={styles.signOutBtn} 
          textStyle={{ color: colors.accentRose }}
        />

        <View style={{ height: 120 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20 },
  header: { marginBottom: 30, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: { fontSize: 40 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingCard: {
    padding: 16,
    marginBottom: 24,
    borderRadius: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingIconText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  signOutBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(244, 63, 94, 0.1)', // Rose with low opacity
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  }
});
