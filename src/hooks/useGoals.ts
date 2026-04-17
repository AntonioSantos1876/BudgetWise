import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Goal } from '../types';
import { useAuth } from '../context/AuthContext';

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGoals(data as Goal[] || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();

    if (!user) return;

    const subscription = supabase
      .channel('public:goals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchGoals]);

  const addGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'current_amount'>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: user.id, current_amount: 0 })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    refresh: fetchGoals
  };
}
