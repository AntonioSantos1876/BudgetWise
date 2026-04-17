-- BudgetWise — Supabase Full Setup Script
-- Paste this into your Supabase SQL Editor and run it in one go.

-- 1. TABLES

-- Profiles (User identity and preferences)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar TEXT,
  primary_currency TEXT DEFAULT 'USD',
  secondary_currency TEXT DEFAULT 'JMD',
  rate_mode TEXT DEFAULT 'live',
  manual_rate NUMERIC DEFAULT 1,
  monthly_income NUMERIC DEFAULT 0,
  theme TEXT DEFAULT 'system',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions (Core financial data)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets (Monthly limits)
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  category TEXT NOT NULL,
  allocated NUMERIC NOT NULL,
  UNIQUE(user_id, month, category)
);

-- Goals (Savings targets)
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🎯',
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Transactions: Users can manage their own transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Budgets: Users can manage their own budgets
CREATE POLICY "Users can manage own budgets" ON public.budgets
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Goals: Users can manage their own goals
CREATE POLICY "Users can manage own goals" ON public.goals
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. AUTOMATION (Triggers)

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', '💰');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
