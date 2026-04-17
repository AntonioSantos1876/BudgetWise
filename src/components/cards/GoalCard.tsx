import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Goal } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../ui/GlassCard';
import { ProgressRing } from '../ui/ProgressRing';

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress }) => {
  const { profile } = useAuth();
  const { convert, formatCurrency } = useCurrency();
  const { colors } = useTheme();

  const primaryCurr = profile?.primary_currency || 'USD';
  // Goal amounts are stored in DB. We assume they are stored in the user's primary currency
  
  const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const isComplete = percentage >= 100;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassCard intensity={60} style={[styles.card, isComplete && { borderColor: colors.accentEmerald, borderWidth: 1 }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{goal.name}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            Target: {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'None'}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.details}>
            <Text style={[styles.current, { color: colors.textPrimary }]}>
              {formatCurrency(goal.current_amount, primaryCurr)}
            </Text>
            <Text style={[styles.target, { color: colors.textSecondary }]}>
              of {formatCurrency(goal.target_amount, primaryCurr)}
            </Text>
          </View>
          
          <ProgressRing 
            percentage={percentage} 
            radius={35} 
            strokeWidth={8} 
            color={isComplete ? colors.accentEmerald : colors.accentBlue} 
            backgroundColor={colors.glassBorder}
          >
            <Text style={[styles.percentText, { color: colors.textPrimary }]}>
              {Math.round(percentage)}%
            </Text>
          </ProgressRing>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  current: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  target: {
    fontSize: 14,
  },
  percentText: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});
