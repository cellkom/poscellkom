-- This script ensures that your database schema matches the application's expectations for transactions.
-- Please run this script in your Supabase SQL Editor.

-- 1. Create sales_transactions table
-- This table stores the main details of each sale.
CREATE TABLE IF NOT EXISTS public.sales_transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    transaction_id_display text,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name_cache text,
    kasir_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    subtotal numeric NOT NULL DEFAULT 0,
    discount numeric NOT NULL DEFAULT 0,
    total numeric NOT NULL DEFAULT 0,
    payment_amount numeric NOT NULL DEFAULT 0,
    change_amount numeric NOT NULL DEFAULT 0,
    remaining_amount numeric NOT NULL DEFAULT 0,
    payment_method text
);

-- 2. Create sales_transaction_items table
-- This table stores every item sold within a transaction.
CREATE TABLE IF NOT EXISTS public.sales_transaction_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    transaction_id uuid NOT NULL REFERENCES public.sales_transactions(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL,
    buy_price_at_sale numeric NOT NULL,
    sale_price_at_sale numeric NOT NULL
);

-- 3. Create installments table
-- This table tracks customer debts from sales or services.
CREATE TABLE IF NOT EXISTS public.installments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    transaction_id_display text,
    transaction_type text,
    customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
    kasir_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    total_amount numeric,
    paid_amount numeric,
    remaining_amount numeric,
    status text,
    details text
);

-- 4. Add columns to existing tables if they are missing
-- This ensures that if you already created some tables, they get updated correctly.
ALTER TABLE public.sales_transactions
ADD COLUMN IF NOT EXISTS transaction_id_display text,
ADD COLUMN IF NOT EXISTS customer_name_cache text,
ADD COLUMN IF NOT EXISTS kasir_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS subtotal numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS change_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_amount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method text;

ALTER TABLE public.installments
ADD COLUMN IF NOT EXISTS transaction_id_display text,
ADD COLUMN IF NOT EXISTS transaction_type text,
ADD COLUMN IF NOT EXISTS kasir_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS total_amount numeric,
ADD COLUMN IF NOT EXISTS paid_amount numeric,
ADD COLUMN IF NOT EXISTS remaining_amount numeric,
ADD COLUMN IF NOT EXISTS status text,
ADD COLUMN IF NOT EXISTS details text;

-- Add comments for clarity
COMMENT ON TABLE public.sales_transactions IS 'Stores main information for each sales transaction.';
COMMENT ON TABLE public.sales_transaction_items IS 'Stores individual items sold in each transaction.';
COMMENT ON TABLE public.installments IS 'Tracks customer debts from sales or services.';