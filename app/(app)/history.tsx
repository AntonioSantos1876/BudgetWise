import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Search, Download } from 'lucide-react-native';
import { ScreenWrapper } from '../../src/components/layout/ScreenWrapper';
import { useTheme } from '../../src/context/ThemeContext';
import { useTransactions } from '../../src/hooks/useTransactions';
import { TransactionRow } from '../../src/components/cards/TransactionRow';
import { TransactionDetailModal } from '../../src/components/modals/TransactionDetailModal';
import { FAB } from '../../src/components/layout/FAB';
import { AddTransactionModal } from '../../src/components/modals/AddTransactionModal';
import { Transaction } from '../../src/types';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { transactions } = useTransactions();
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Filter by type
      if (filterType !== 'all' && t.type !== filterType) return false;
      // 2. Search by note or category name
      if (search) {
        const query = search.toLowerCase();
        const catMatch = t.category.toLowerCase().includes(query);
        const noteMatch = (t.note || '').toLowerCase().includes(query);
        if (!catMatch && !noteMatch) return false;
      }
      return true;
    });
  }, [transactions, search, filterType]);

  const handleExportCSV = async () => {
    if (filteredTransactions.length === 0) {
      Alert.alert('Empty', 'No transactions to export.');
      return;
    }

    const header = 'Date,Type,Category,Amount,Currency,Note\n';
    const rows = filteredTransactions.map(t => 
      `${t.date},${t.type},${t.category},${t.amount},${t.currency},"${t.note || ''}"`
    ).join('\n');
    
    const csvContent = header + rows;
    
    if (Platform.OS === 'web') {
      // Very basic approach for web: log to console or alert since Expo Sharing/FileSystem is missing
      console.log('CSV Export:', csvContent);
      Alert.alert('Web Export', 'CSV generated in console (Full web download coming soon).');
      return;
    }

    const fileUri = (FileSystem as any).documentDirectory + 'budgetwise_export.csv';
    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: (FileSystem as any).EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Not Available', 'Sharing is not available on this device');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to generate CSV');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>History</Text>
          <TouchableOpacity onPress={handleExportCSV}>
            <Download color={colors.accentBlue} size={24} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.glassFill, borderColor: colors.glassBorder }]}>
          <Search color={colors.textSecondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search notes or categories..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          {(['all', 'income', 'expense'] as const).map(type => (
            <TouchableOpacity 
              key={type} 
              onPress={() => setFilterType(type)}
              style={[
                styles.filterChip, 
                { borderColor: colors.glassBorder },
                filterType === type && { backgroundColor: colors.accentViolet }
              ]}
            >
              <Text style={{ color: filterType === type ? '#fff' : colors.textSecondary, textTransform: 'capitalize' }}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredTransactions.map(t => (
            <TransactionRow 
              key={t.id} 
              transaction={t} 
              onPress={() => setSelectedTx(t)}
            />
          ))}
          {filteredTransactions.length === 0 && (
            <Text style={[styles.emptyState, { color: colors.textSecondary }]}>No matching transactions.</Text>
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>

      <FAB onPress={() => setAddModalVisible(true)} />
      
      <AddTransactionModal 
        visible={addModalVisible} 
        onClose={() => setAddModalVisible(false)} 
      />

      <TransactionDetailModal
        transaction={selectedTx}
        visible={selectedTx !== null}
        onClose={() => setSelectedTx(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  filterRow: { flexDirection: 'row', marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyState: {
    textAlign: 'center',
    paddingTop: 40,
  }
});
