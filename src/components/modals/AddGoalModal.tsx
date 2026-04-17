import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useGoals } from '../../hooks/useGoals';
import { GlassButton } from '../ui/GlassButton';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { addGoal } = useGoals();
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = async () => {
    if (!name || !targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      Alert.alert('Invalid input', 'Please enter a valid name and target amount.');
      return;
    }

    try {
      await addGoal({
        name,
        target_amount: Number(targetAmount),
        target_date: targetDate,
      });
      setName('');
      setTargetAmount('');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save goal.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={40} tint="dark" style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} />
        
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#111118' : '#fff' }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>New Goal</Text>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Goal Name</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.glassBorder, backgroundColor: colors.glassFill }]}
            placeholder="e.g. Vacation"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Target Amount ({profile?.primary_currency || 'USD'})
          </Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.glassBorder, backgroundColor: colors.glassFill }]}
            placeholder="10000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={targetAmount}
            onChangeText={setTargetAmount}
          />

          <Text style={[styles.label, { color: colors.textPrimary }]}>Target Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.glassBorder, backgroundColor: colors.glassFill }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
            value={targetDate}
            onChangeText={setTargetDate}
          />

          <View style={styles.footer}>
            <GlassButton title="Cancel" onPress={onClose} style={[styles.button, { backgroundColor: 'transparent' }]} textStyle={{color: colors.textSecondary}} />
            <GlassButton title="Create Goal" onPress={handleSave} style={styles.button} />
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
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { flex: 1, marginHorizontal: 8 }
});
