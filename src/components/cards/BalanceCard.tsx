import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Transaction } from '../../types';

interface BalanceCardProps {
  transactions: Transaction[];
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ transactions }) => {
  const { profile } = useAuth();
  const { convert, formatCurrency, loading } = useCurrency();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + convert(t.amount, t.currency, profile?.primary_currency || 'USD'), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + convert(t.amount, t.currency, profile?.primary_currency || 'USD'), 0);

  const netBalance = totalIncome - totalExpense;

  const primaryCurr = profile?.primary_currency || 'USD';
  const secondaryCurr = profile?.secondary_currency || 'JMD';

  const secondaryBalance = convert(netBalance, primaryCurr, secondaryCurr);

  return (
    <GlassCard intensity={90} style={styles.card}>
      <Text style={styles.label}>Net Balance</Text>
      <Text style={styles.balance}>
        {loading ? '---' : formatCurrency(netBalance, primaryCurr)}
      </Text>
      <View style={styles.secondaryContainer}>
        <Text style={styles.secondaryText}>
          ≈ {loading ? '---' : formatCurrency(secondaryBalance, secondaryCurr)}
        </Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 8,
  },
  balance: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  secondaryContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  secondaryText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  }
});
