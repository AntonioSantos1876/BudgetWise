import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Budget } from '../types';
import { useAuth } from '../context/AuthContext';

export function useBudgets(month: string) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month);

      if (error) throw error;
      setBudgets(data as Budget[] || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  }, [user, month]);

  useEffect(() => {
    fetchBudgets();

    if (!user) return;

    const subscription = supabase
      .channel(`public:budgets:${month}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchBudgets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, month, fetchBudgets]);

  const upsertBudget = async (category: string, allocated: number) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('budgets')
      .upsert({ user_id: user.id, month, category, allocated }, { onConflict: 'user_id,month,category' })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  return {
    budgets,
    loading,
    upsertBudget,
    deleteBudget,
    refresh: fetchBudgets
  };
}
