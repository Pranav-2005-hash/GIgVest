-- Add round-up columns to transactions table
ALTER TABLE public.transactions 
ADD COLUMN round_up_applied boolean NOT NULL DEFAULT false,
ADD COLUMN round_up_amount numeric NOT NULL DEFAULT 0;