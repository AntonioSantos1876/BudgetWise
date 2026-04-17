import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CATEGORIES } from '../../constants/categories';
import { useTheme } from '../../context/ThemeContext';

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, onPress }) => {
  const { profile } = useAuth();
  const { convert, formatCurrency } = useCurrency();
  const { colors } = useTheme();

  const primaryCurr = profile?.primary_currency || 'USD';
  const amountInPrimary = convert(transaction.amount, transaction.currency, primaryCurr);
  
  const categoryConfig = CATEGORIES.find(c => c.id === transaction.category) || CATEGORIES[CATEGORIES.length - 1]; // Fallback to 'other'
  
  const isIncome = transaction.type === 'income';
  const formattedAmount = `${isIncome ? '+' : '-'}${formatCurrency(amountInPrimary, primaryCurr)}`;
  const amountColor = isIncome ? colors.accentEmerald : colors.textPrimary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: categoryConfig.color + '20' }]}>
        <Text style={styles.icon}>{categoryConfig.icon}</Text>
      </View>
      <View style={styles.details}>
        <Text style={[styles.category, { color: colors.textPrimary }]}>{categoryConfig.label}</Text>
        {transaction.note ? (
          <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
            {transaction.note}
          </Text>
        ) : null}
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: amountColor }]}>{formattedAmount}</Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date(transaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  details: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  note: {
    fontSize: 13,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
  }
});
