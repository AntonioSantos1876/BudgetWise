import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryGroup } from 'victory-native';
import { Transaction } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { GlassCard } from '../ui/GlassCard';

interface MonthlyBarProps {
  transactions: Transaction[];
}

export const MonthlyBar: React.FC<MonthlyBarProps> = ({ transactions }) => {
  const { colors } = useTheme();
  const { profile } = useAuth();
  const { convert } = useCurrency();

  // Basic monthly grouping for the last 6 months
  const now = new Date();
  const monthsData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      monthLabel: d.toLocaleDateString(undefined, { month: 'short' }),
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      income: 0,
      expense: 0
    };
  }).reverse(); // chronological order

  transactions.forEach(t => {
    const d = new Date(t.date);
    const m = monthsData.find(md => md.monthIndex === d.getMonth() && md.year === d.getFullYear());
    if (m) {
      const amount = convert(t.amount, t.currency, profile?.primary_currency || 'USD');
      if (t.type === 'income') m.income += amount;
      else m.expense += amount;
    }
  });

  const incomeData = monthsData.map(m => ({ x: m.monthLabel, y: m.income }));
  const expenseData = monthsData.map(m => ({ x: m.monthLabel, y: m.expense }));

  return (
    <GlassCard intensity={60} style={styles.card}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Cash Flow</Text>
      <View style={styles.chartContainer}>
        <VictoryChart 
          domainPadding={20} 
          width={Dimensions.get('window').width - 60} 
          height={220}
        >
          <VictoryAxis 
            style={{ 
              tickLabels: { fill: colors.textSecondary, fontSize: 10 },
              axis: { stroke: colors.glassBorder }
            }} 
          />
          <VictoryGroup offset={10} colorScale={[colors.accentEmerald, colors.accentRose]}>
            <VictoryBar data={incomeData} cornerRadius={4} />
            <VictoryBar data={expenseData} cornerRadius={4} />
          </VictoryGroup>
        </VictoryChart>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chartContainer: {
    alignItems: 'center',
    marginLeft: -10, // Adjust for Victory offset
  }
});
