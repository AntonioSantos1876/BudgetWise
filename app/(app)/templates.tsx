import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useBudgets } from '../../src/hooks/useBudgets';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { GlassButton } from '../../src/components/ui/GlassButton';
import { CATEGORIES } from '../../src/constants/categories';
import { ProgressRing } from '../../src/components/ui/ProgressRing';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useCurrency } from '../../src/context/CurrencyContext';

const PRESET_TEMPLATES = [
  { name: '50/30/20 Rule', desc: '50% Needs, 30% Wants, 20% Savings' },
  { name: 'Frugal', desc: 'Aggressive savings focus' },
  { name: 'Custom', desc: 'Build your own' },
];

export default function TemplatesScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const { budgets, loading, upsertBudget, refresh } = useBudgets(currentMonth);
  const { transactions } = useTransactions();
  const { convert, formatCurrency } = useCurrency();

  const [selectedTemplate, setSelectedTemplate] = useState(PRESET_TEMPLATES[0].name);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const primaryCurr = profile?.primary_currency || 'USD';

  // Calculate actual spending per category for this month
  const actuals = CATEGORIES.reduce((acc, cat) => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === cat.id && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + convert(t.amount, t.currency, primaryCurr), 0);
    acc[cat.id] = spent;
    return acc;
  }, {} as Record<string, number>);

  const handleApplyTemplate = async () => {
    Alert.alert('Coming Soon', 'Auto-filling categories based on your income profile will be available soon. For now, set limits manually below.');
  };

  const handleSaveLimit = async (categoryId: string) => {
    if (!editValue || isNaN(Number(editValue))) {
      setEditingCategory(null);
      return;
    }
    await upsertBudget(categoryId, Number(editValue));
    setEditingCategory(null);
    setEditValue('');
  };

  if (loading) {
    return (
      <ScreenWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accentViolet} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Budgets & Templates</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Choose a Starting Template</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
          {PRESET_TEMPLATES.map(tpl => (
            <TouchableOpacity 
              key={tpl.name}
              onPress={() => setSelectedTemplate(tpl.name)}
            >
              <GlassCard 
                intensity={selectedTemplate === tpl.name ? 90 : 40} 
                style={[
                  styles.templateCard, 
                  selectedTemplate === tpl.name && { borderColor: colors.accentBlue, borderWidth: 1 }
                ]}
              >
                <Text style={[styles.templateName, { color: colors.textPrimary }]}>{tpl.name}</Text>
                <Text style={[styles.templateDesc, { color: colors.textSecondary }]}>{tpl.desc}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <GlassButton title="Apply Template" onPress={handleApplyTemplate} style={styles.applyBtn} />

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>This Month's Limits ({currentMonth})</Text>
        
        {CATEGORIES.filter(c => c.id !== 'income' && c.id !== 'freelance').map(cat => {
          const b = budgets.find(b => b.category === cat.id);
          const allocated = b?.allocated || 0;
          const spent = actuals[cat.id] || 0;
          const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
          
          const isEditing = editingCategory === cat.id;

          return (
            <View key={cat.id} style={styles.budgetRow}>
              <View style={styles.budgetHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.emoji}>{cat.icon}</Text>
                  <Text style={[styles.catName, { color: colors.textPrimary }]}>{cat.label}</Text>
                </View>
                {isEditing ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={[styles.editInput, { color: colors.textPrimary, borderColor: colors.glassBorder }]}
                      keyboardType="numeric"
                      autoFocus
                      placeholder="Amount"
                      placeholderTextColor={colors.textSecondary}
                      value={editValue}
                      onChangeText={setEditValue}
                      onSubmitEditing={() => handleSaveLimit(cat.id)}
                      onBlur={() => handleSaveLimit(cat.id)}
                    />
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => { setEditingCategory(cat.id); setEditValue(allocated ? allocated.toString() : ''); }}>
                    <Text style={[styles.allocated, { color: allocated > 0 ? colors.accentEmerald : colors.textSecondary }]}>
                      {allocated > 0 ? formatCurrency(allocated, primaryCurr) : 'Set Limit'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {allocated > 0 && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.glassBorder }]}>
                    <View style={[
                      styles.progressBarFill, 
                      { 
                        backgroundColor: percentage > 100 ? colors.accentRose : cat.color,
                        width: `${Math.min(percentage, 100)}%` 
                      }
                    ]} />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{formatCurrency(spent, primaryCurr)} spent</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{formatCurrency(allocated - spent, primaryCurr)} left</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20 },
  header: { marginBottom: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  sectionTitle: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  templateScroll: { flexDirection: 'row', marginBottom: 16 },
  templateCard: {
    width: 160,
    height: 100,
    padding: 16,
    marginRight: 12,
    justifyContent: 'center',
  },
  templateName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  templateDesc: { fontSize: 12 },
  applyBtn: { marginBottom: 30 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 30 },
  
  budgetRow: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emoji: { fontSize: 20, marginRight: 8 },
  catName: { fontSize: 16, fontWeight: '600' },
  allocated: { fontSize: 16, fontWeight: 'bold' },
  editContainer: { flexDirection: 'row', alignItems: 'center' },
  editInput: {
    borderBottomWidth: 1,
    fontSize: 16,
    minWidth: 80,
    textAlign: 'right',
  },
  progressContainer: { marginTop: 12 },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }
});
