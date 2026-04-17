import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useCurrency } from '../../src/context/CurrencyContext';
import { BalanceCard } from '../../src/components/cards/BalanceCard';
import { SummaryCard } from '../../src/components/cards/SummaryCard';
import { ExpenseDonut } from '../../src/components/charts/ExpenseDonut';
import { MonthlyBar } from '../../src/components/charts/MonthlyBar';
import { TransactionRow } from '../../src/components/cards/TransactionRow';
import { FAB } from '../../src/components/layout/FAB';
import { AddTransactionModal } from '../../src/components/modals/AddTransactionModal';
import { Logo } from '../../src/components/ui/Logo';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const { transactions } = useTransactions();
  const { convert, formatCurrency } = useCurrency();
  const [modalVisible, setModalVisible] = useState(false);

  // Summaries
  const primaryCurr = profile?.primary_currency || 'USD';
  
  const thisMonthTrans = transactions.filter(t => {
    const today = new Date();
    const tDate = new Date(t.date);
    return tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear();
  });

  const totalIncome = thisMonthTrans
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + convert(t.amount, t.currency, primaryCurr), 0);

  const totalExpense = thisMonthTrans
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + convert(t.amount, t.currency, primaryCurr), 0);

  const totalSaved = thisMonthTrans
    .filter(t => t.type === 'expense' && t.category === 'savings')
    .reduce((acc, t) => acc + convert(t.amount, t.currency, primaryCurr), 0);

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Logo size={40} showText={false} style={{ marginRight: 12 }} />
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Good morning, {profile?.display_name || 'Guest'} 👋
            </Text>
          </View>
        </View>

        <BalanceCard transactions={transactions} />

        <View style={styles.summaryRow}>
          <SummaryCard label="Income" amount={formatCurrency(totalIncome, primaryCurr)} color={colors.accentEmerald} />
          <SummaryCard label="Expenses" amount={formatCurrency(totalExpense, primaryCurr)} color={colors.accentRose} />
          <SummaryCard label="Saved" amount={formatCurrency(totalSaved, primaryCurr)} color={colors.accentBlue} />
        </View>

        <ExpenseDonut transactions={thisMonthTrans} />
        
        <MonthlyBar transactions={transactions} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Transactions</Text>
        </View>
        <View style={styles.recentList}>
          {transactions.slice(0, 5).map(t => (
            <TransactionRow key={t.id} transaction={t} />
          ))}
          {transactions.length === 0 && (
            <Text style={[styles.emptyState, { color: colors.textSecondary }]}>No transactions yet.</Text>
          )}
        </View>
        
        {/* Spacer for FAB and Bottom Tabs */}
        <View style={{ height: 120 }} />
      </ScrollView>

      <FAB onPress={() => setModalVisible(true)} />
      
      <AddTransactionModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: -4,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentList: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyState: {
    textAlign: 'center',
    paddingVertical: 20,
  }
});
