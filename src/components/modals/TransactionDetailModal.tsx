import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { useTransactions } from '../../hooks/useTransactions';
import { CATEGORIES } from '../../constants/categories';
import { GlassButton } from '../ui/GlassButton';
import { Transaction } from '../../types';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  visible: boolean;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const { updateTransaction, deleteTransaction } = useTransactions();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setNote(transaction.note || '');
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }

    try {
      await updateTransaction(transaction.id, {
        amount: Number(amount),
        category,
        note,
      });
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update transaction.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
              onClose();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
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
            <Text style={[styles.title, { color: colors.textPrimary }]}>Edit Transaction</Text>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={{ color: colors.accentRose, fontWeight: 'bold' }}>Delete</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.amountInput, { color: colors.textPrimary, borderBottomColor: colors.glassBorder }]}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={[styles.currencyLabel, { color: colors.textSecondary }]}>
            {transaction.currency}
          </Text>

          <Text style={[styles.label, { color: colors.textPrimary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map(c => {
               if (transaction.type === 'expense' && (c.id === 'income' || c.id === 'freelance')) return null;
               if (transaction.type === 'income' && c.id !== 'income' && c.id !== 'freelance' && c.id !== 'other') return null;

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

          <Text style={[styles.label, { color: colors.textPrimary }]}>Note</Text>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.glassBorder, backgroundColor: colors.glassFill }]}
            placeholder="No note"
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
          />

          <View style={styles.footer}>
            <GlassButton title="Cancel" onPress={onClose} style={[styles.button, { backgroundColor: 'transparent' }]} textStyle={{color: colors.textSecondary}} />
            <GlassButton title="Save Changes" onPress={handleSave} style={styles.button} />
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
    height: '75%',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 4,
  },
  currencyLabel: { textAlign: 'center', fontSize: 16, marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  categoryScroll: { flexDirection: 'row', marginBottom: 24, maxHeight: 100 },
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
  categoryEmoji: { fontSize: 24, marginBottom: 4 },
  categoryLabel: { fontSize: 12 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 20 },
  button: { flex: 1, marginHorizontal: 8 }
});
