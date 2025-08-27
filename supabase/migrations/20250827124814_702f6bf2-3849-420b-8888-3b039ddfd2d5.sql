-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'savings', 'investment')),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create savings table
CREATE TABLE public.savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit_events table
CREATE TABLE public.credit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('score_update', 'payment', 'inquiry', 'account_opened', 'account_closed')),
  description TEXT NOT NULL,
  impact_score INTEGER, -- positive or negative impact on credit score
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_contributions table
CREATE TABLE public.community_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tip', 'question', 'success_story', 'resource')),
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_contributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for savings
CREATE POLICY "Users can view their own savings" 
ON public.savings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings" 
ON public.savings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings" 
ON public.savings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings" 
ON public.savings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for credit_events
CREATE POLICY "Users can view their own credit events" 
ON public.credit_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credit events" 
ON public.credit_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit events" 
ON public.credit_events 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for community_contributions
CREATE POLICY "Anyone can view published community contributions" 
ON public.community_contributions 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Users can create their own community contributions" 
ON public.community_contributions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community contributions" 
ON public.community_contributions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community contributions" 
ON public.community_contributions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_updated_at
  BEFORE UPDATE ON public.savings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_events_updated_at
  BEFORE UPDATE ON public.credit_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_contributions_updated_at
  BEFORE UPDATE ON public.community_contributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();