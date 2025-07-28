-- ### CELLKOM POS DATABASE SCHEMA ###

-- 1. Tipe data kustom untuk peran pengguna dan status
CREATE TYPE public.user_role AS ENUM ('Admin', 'Kasir');
CREATE TYPE public.service_status AS ENUM ('Pending', 'Proses', 'Selesai', 'Gagal/Cancel', 'Sudah Diambil');
CREATE TYPE public.payment_method AS ENUM ('tunai', 'cicilan');

-- 2. Konfigurasi Tabel `profiles` untuk menyimpan data pengguna tambahan
-- Tabel ini terhubung dengan sistem otentikasi Supabase.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'Kasir' NOT NULL;

-- Fungsi yang berjalan otomatis saat ada user baru mendaftar
-- untuk membuatkan profilnya.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'Kasir');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk memanggil fungsi di atas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Tabel `customers` untuk data pelanggan
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT
);
-- Menambahkan "Pelanggan Umum" sebagai data awal
INSERT INTO public.customers (id, name, phone) VALUES ('00000000-0000-0000-0000-000000000001', 'Pelanggan Umum', '-');

-- 4. Tabel `suppliers` untuk data pemasok
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT
);

-- 5. Tabel `products` untuk manajemen stok barang
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  stock INT DEFAULT 0 NOT NULL,
  buy_price NUMERIC DEFAULT 0 NOT NULL,
  retail_price NUMERIC DEFAULT 0 NOT NULL,
  reseller_price NUMERIC DEFAULT 0 NOT NULL,
  barcode TEXT UNIQUE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL
);
CREATE INDEX idx_products_name ON public.products(name);
CREATE INDEX idx_products_barcode ON public.products(barcode);

-- 6. Tabel `service_entries` untuk data service masuk (tanda terima)
CREATE TABLE public.service_entries (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  kasir_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT,
  device_type TEXT,
  damage_type TEXT,
  description TEXT,
  status service_status DEFAULT 'Pending' NOT NULL
);

-- 7. Tabel `sales_transactions` untuk mencatat transaksi penjualan
CREATE TABLE public.sales_transactions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  customer_id UUID REFERENCES public.customers(id) NOT NULL,
  kasir_id UUID REFERENCES auth.users(id) NOT NULL,
  payment_method payment_method NOT NULL,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC NOT NULL
);

-- 8. Tabel `sales_items` untuk detail barang pada setiap transaksi penjualan
CREATE TABLE public.sales_items (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT REFERENCES public.sales_transactions(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  quantity INT NOT NULL,
  sale_price NUMERIC NOT NULL, -- Harga jual saat transaksi
  cost_price NUMERIC NOT NULL  -- Harga modal saat transaksi
);

-- 9. Tabel `service_transactions` untuk mencatat transaksi service (nota service)
CREATE TABLE public.service_transactions (
  id BIGSERIAL PRIMARY KEY,
  service_entry_id BIGINT REFERENCES public.service_entries(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  kasir_id UUID REFERENCES auth.users(id) NOT NULL,
  service_fee NUMERIC DEFAULT 0 NOT NULL,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC NOT NULL,
  payment_method payment_method NOT NULL
);

-- 10. Tabel `service_parts_used` untuk detail sparepart yang digunakan
CREATE TABLE public.service_parts_used (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT REFERENCES public.service_transactions(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  quantity INT NOT NULL,
  sale_price NUMERIC NOT NULL -- Harga jual sparepart saat itu
);

-- 11. Tabel `payments` untuk mencatat pembayaran cicilan
CREATE TABLE public.payments (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  amount NUMERIC NOT NULL,
  kasir_id UUID REFERENCES auth.users(id) NOT NULL,
  sales_transaction_id BIGINT REFERENCES public.sales_transactions(id) ON DELETE SET NULL,
  service_transaction_id BIGINT REFERENCES public.service_transactions(id) ON DELETE SET NULL,
  CONSTRAINT chk_one_transaction CHECK (
    (sales_transaction_id IS NOT NULL AND service_transaction_id IS NULL) OR
    (sales_transaction_id IS NULL AND service_transaction_id IS NOT NULL)
  )
);

-- ### KEAMANAN: MENGAKTIFKAN ROW LEVEL SECURITY (RLS) ###
-- Ini memastikan data hanya bisa diakses oleh pengguna yang sudah login.
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_parts_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ### KEBIJAKAN AKSES (POLICIES) ###
-- Aturan dasar: Semua pengguna yang sudah login bisa mengakses semua data.
-- Anda bisa membuat aturan lebih spesifik nanti jika diperlukan.
CREATE POLICY "Allow all access to authenticated users" ON public.customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.service_entries FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.sales_transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.sales_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.service_transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.service_parts_used FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.payments FOR ALL TO authenticated USING (true);

-- Aturan khusus untuk tabel profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin' );