import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useGoals } from '../../hooks/useGoals';
import { GlassButton } from '../ui/GlassButton';
import { Goal } from '../../types';

interface GoalDetailModalProps {
  goal: Goal | null;
  visible: boolean;
  onClose: () => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({ goal, visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { updateGoal, deleteGoal } = useGoals();
  
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    setAddAmount('');
  }, [goal]);

  if (!goal) return null;

  const handleContribute = async () => {
    if (!addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }

    try {
      const newAmount = goal.current_amount + Number(addAmount);
      await updateGoal(goal.id, { current_amount: newAmount });
      
      if (newAmount >= goal.target_amount) {
        Alert.alert('🎉 Goal Reached!', `Congratulations! You have reached your goal for ${goal.name}.`);
      }
      
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update goal.');
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive",
        onPress: async () => {
          try {
            await deleteGoal(goal.id);
            onClose();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={40} tint="dark" style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} />
        
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#111118' : '#fff' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{goal.name}</Text>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={{ color: colors.accentRose, fontWeight: 'bold' }}>Delete</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Add Contribution ({profile?.primary_currency || 'USD'})</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.textPrimary, borderBottomColor: colors.glassBorder }]}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={addAmount}
            onChangeText={setAddAmount}
            autoFocus
          />

          <View style={styles.footer}>
            <GlassButton title="Cancel" onPress={onClose} style={[styles.button, { backgroundColor: 'transparent' }]} textStyle={{color: colors.textSecondary}} />
            <GlassButton title="Contribute" onPress={handleContribute} style={styles.button} />
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 30,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { flex: 1, marginHorizontal: 8 }
});
