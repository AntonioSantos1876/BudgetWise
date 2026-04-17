import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '../ui/GlassCard';

interface SummaryCardProps {
  label: string;
  amount: string;
  color: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ label, amount, color }) => {
  return (
    <GlassCard intensity={60} style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.amount, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {amount}
      </Text>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});
