import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { useTheme } from '../../src/context/ThemeContext';
import { useGoals } from '../../src/hooks/useGoals';
import { GoalCard } from '../../src/components/cards/GoalCard';
import { FAB } from '../../src/components/layout/FAB';
import { AddGoalModal } from '../../src/components/modals/AddGoalModal';
import { GoalDetailModal } from '../../src/components/modals/GoalDetailModal';
import { Goal } from '../../src/types';

export default function GoalsScreen() {
  const { colors } = useTheme();
  const { goals, loading } = useGoals();
  
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  if (loading) {
    return (
      <ScreenWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.accentBlue} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Savings Goals</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your progress and stay motivated.
          </Text>
        </View>

        {goals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            onPress={() => setSelectedGoal(goal)} 
          />
        ))}

        {goals.length === 0 && (
          <Text style={[styles.emptyState, { color: colors.textSecondary }]}>
            No goals yet. Tap the + button to create one!
          </Text>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <FAB onPress={() => setAddModalVisible(true)} />
      
      <AddGoalModal 
        visible={addModalVisible} 
        onClose={() => setAddModalVisible(false)} 
      />

      <GoalDetailModal
        goal={selectedGoal}
        visible={selectedGoal !== null}
        onClose={() => setSelectedGoal(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20 },
  header: { marginBottom: 30, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  emptyState: { textAlign: 'center', paddingTop: 40 }
});
