-- Tambahkan kolom kasir_id jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_entries' AND column_name='kasir_id') THEN
        ALTER TABLE service_entries
        ADD COLUMN kasir_id UUID;
    END IF;
END
$$;

-- Tambahkan foreign key constraint ke tabel profiles jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_entries_kasir_id_fkey') THEN
        ALTER TABLE service_entries
        ADD CONSTRAINT service_entries_kasir_id_fkey FOREIGN KEY (kasir_id) REFERENCES profiles(id);
    END IF;
END
$$;

-- Jika kolom kasir_id sudah ada tapi bisa NULL, dan Anda ingin membuatnya NOT NULL,
-- Anda perlu mengisi nilai untuk baris yang sudah ada terlebih dahulu, contoh:
-- UPDATE service_entries SET kasir_id = 'ID_KASIR_DEFAULT_ANDA' WHERE kasir_id IS NULL;
-- Kemudian baru jalankan:
-- ALTER TABLE service_entries ALTER COLUMN kasir_id SET NOT NULL;
-- Namun, error yang Anda alami menunjukkan kolom ini SUDAH NOT NULL, jadi Anda hanya perlu memastikan aplikasi mengirim nilainya.