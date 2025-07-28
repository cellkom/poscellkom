ALTER TABLE service_entries
ADD COLUMN date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN customer_id UUID REFERENCES customers(id),
ADD COLUMN category TEXT,
ADD COLUMN device_type TEXT,
ADD COLUMN damage_type TEXT,
ADD COLUMN description TEXT,
ADD COLUMN status TEXT DEFAULT 'Pending';