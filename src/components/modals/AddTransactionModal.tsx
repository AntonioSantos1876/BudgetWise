import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { CATEGORIES } from '../../constants/categories';
import { GlassButton } from '../ui/GlassButton';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const { addTransaction } = useTransactions();
  
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [note, setNote] = useState('');

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }

    try {
      await addTransaction({
        type,
        amount: Number(amount),
        currency: profile?.primary_currency || 'USD',
        category,
        note,
        date: new Date().toISOString().split('T')[0], // yyyy-mm-dd
      });
      // reset form
      setAmount('');
      setNote('');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save transaction.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={40} tint="dark" style={styles.backdrop}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} />
        
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#111118' : '#fff' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>New Transaction</Text>
          </View>

          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeBtn, type === 'expense' && { backgroundColor: colors.accentRose }]} 
              onPress={() => { setType('expense'); setCategory('food'); }}
            >
              <Text style={styles.typeText}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, type === 'income' && { backgroundColor: colors.accentEmerald }]} 
              onPress={() => { setType('income'); setCategory('income'); }}
            >
              <Text style={styles.typeText}>Income</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.amountInput, { color: colors.textPrimary, borderBottomColor: colors.glassBorder }]}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>
            {profile?.primary_currency || 'USD'}
          </Text>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map(c => {
              // Hide income categories if expense, and vice versa
              if (type === 'expense' && (c.id === 'income' || c.id === 'freelance')) return null;
              if (type === 'income' && c.id !== 'income' && c.id !== 'freelance' && c.id !== 'other') return null;

              return (
                <TouchableOpacity 
                  key={c.id} 
                  style={[
                    styles.categoryBtn, 
                    category === c.id && { backgroundColor: c.color + '40', borderColor: c.color }
                  ]}
                  onPress={() => setCategory(c.id)}
                >
                  <Text style={styles.categoryEmoji}>{c.icon}</Text>
                  <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.glassBorder, backgroundColor: colors.glassFill }]}
            placeholder="What was this for?"
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
          />

          <View style={styles.footer}>
            <GlassButton title="Cancel" onPress={onClose} style={[styles.button, { backgroundColor: 'transparent' }]} textStyle={{color: colors.textSecondary}} />
            <GlassButton title="Save" onPress={handleSave} style={styles.button} />
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 4,
  },
  currencyLabel: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 24,
    maxHeight: 100,
  },
  categoryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  }
});
