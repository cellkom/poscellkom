-- 1. Create sales_transactions table first
CREATE TABLE IF NOT EXISTS public.sales_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    transaction_id_display text,
    customer_id uuid,
    customer_name_cache text,
    kasir_id uuid,
    subtotal numeric NOT NULL DEFAULT 0,
    discount numeric NOT NULL DEFAULT 0,
    total numeric NOT NULL DEFAULT 0,
    payment_amount numeric NOT NULL DEFAULT 0,
    change_amount numeric NOT NULL DEFAULT 0,
    remaining_amount numeric NOT NULL DEFAULT 0,
    payment_method text,
    
    -- Add foreign key constraints AFTER table creation
    CONSTRAINT fk_customer 
        FOREIGN KEY (customer_id) 
        REFERENCES public.customers(id) 
        ON DELETE SET NULL,
    
    CONSTRAINT fk_kasir 
        FOREIGN KEY (kasir_id) 
        REFERENCES auth.users(id) 
        ON DELETE SET NULL
);

-- 2. Create sales_transaction_items table
CREATE TABLE IF NOT EXISTS public.sales_transaction_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    transaction_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    buy_price_at_sale numeric NOT NULL,
    sale_price_at_sale numeric NOT NULL,
    
    -- Add foreign key constraints AFTER table creation
    CONSTRAINT fk_transaction 
        FOREIGN KEY (transaction_id) 
        REFERENCES public.sales_transactions(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_product 
        FOREIGN KEY (product_id) 
        REFERENCES public.products(id) 
        ON DELETE RESTRICT
);