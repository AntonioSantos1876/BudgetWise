import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryPie } from 'victory-native';
import { Transaction } from '../../types';
import { CATEGORIES } from '../../constants/categories';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/GlassCard';

interface ExpenseDonutProps {
  transactions: Transaction[];
}

export const ExpenseDonut: React.FC<ExpenseDonutProps> = ({ transactions }) => {
  const { colors } = useTheme();

  const expenses = transactions.filter(t => t.type === 'expense');
  
  if (expenses.length === 0) {
    return (
      <GlassCard intensity={60} style={styles.card}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Expense Breakdown</Text>
        <Text style={[styles.empty, { color: colors.textSecondary }]}>No expenses this month</Text>
      </GlassCard>
    );
  }

  const categoryTotals: Record<string, number> = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
  });

  const parsedData = Object.keys(categoryTotals).map(category => {
    const config = CATEGORIES.find(c => c.id === category) || CATEGORIES[CATEGORIES.length - 1];
    return {
      x: config.label,
      y: categoryTotals[category],
      color: config.color,
    };
  });

  // Sort by highest expense
  parsedData.sort((a, b) => b.y - a.y);

  return (
    <GlassCard intensity={60} style={styles.card}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Expense Breakdown</Text>
      <View style={styles.chartContainer}>
        <VictoryPie
          data={parsedData}
          colorScale={parsedData.map(d => d.color)}
          innerRadius={70}
          padding={40}
          height={250}
          width={300}
          labels={({ datum }) => datum.y > 0 ? '' : ''} // Hide text labels on chart for minimal look, rely on legend
        />
      </View>
      
      <View style={styles.legend}>
        {parsedData.slice(0, 5).map((d) => (
          <View key={d.x} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: d.color }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]} numberOfLines={1}>
              {d.x}
            </Text>
          </View>
        ))}
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
    marginVertical: -20, // Negative margin to tighten up Victory's default padding
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 40,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
    width: '45%',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  }
});
