-- This script corrects a column name mismatch in the 'sales_transactions' table.
-- The application code expects a column named 'total', but the database schema
-- might have a column named 'total_amount' instead. This script renames it.

DO $$
BEGIN
   -- Check if 'total_amount' column exists and 'total' does not.
   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_transactions' AND column_name='total_amount') AND
      NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_transactions' AND column_name='total') THEN
      
      -- Rename the column
      ALTER TABLE public.sales_transactions RENAME COLUMN total_amount TO total;
      RAISE NOTICE 'Renamed column total_amount to total in sales_transactions.';
      
   END IF;
END $$;

-- This ensures the column has the correct constraints, regardless of whether it was renamed or already existed.
ALTER TABLE public.sales_transactions
ALTER COLUMN total SET NOT NULL,
ALTER COLUMN total SET DEFAULT 0;

-- Add a comment for clarity
COMMENT ON COLUMN public.sales_transactions.total IS 'The final amount of the transaction after discounts.';