-- This script modifies the 'sales_transactions' table to allow sales to be made
-- without associating them with a registered customer (e.g., for guest or walk-in customers).
-- It achieves this by removing the "NOT NULL" constraint from the customer_id column.

ALTER TABLE public.sales_transactions
ALTER COLUMN customer_id DROP NOT NULL;

-- Add a comment for clarity
COMMENT ON COLUMN public.sales_transactions.customer_id IS 'The customer associated with the sale. Can be NULL for guest transactions.';