import { useState, useEffect } from 'react';

// This is a mock database to simulate shared state between pages.
// In a real application, this would be handled by a proper state management solution 
// (like Zustand, Redux, or React Query with a backend).

export interface ServiceEntry {
  id: string;
  date: Date;
  customerId: string;
  customerName: string;
  customerPhone: string;
  category: string;
  deviceType: string;
  damageType: string;
  description: string;
  status: 'Pending' | 'Proses' | 'Selesai' | 'Gagal/Cancel' | 'Sudah Diambil';
}

// We are defining this outside the component to persist across page navigations.
const initialServiceEntries: ServiceEntry[] = [
    {
        id: 'SRV-IN-1700000000000',
        date: new Date('2023-11-15T10:00:00'),
        customerId: 'CUS002',
        customerName: 'Budi Santoso',
        customerPhone: '081234567890',
        category: 'Handphone',
        deviceType: 'iPhone 12',
        damageType: 'LCD Pecah',
        description: 'Layar retak di pojok kanan atas.',
        status: 'Pending',
    },
    {
        id: 'SRV-IN-1700000000001',
        date: new Date('2023-11-16T14:30:00'),
        customerId: 'CUS003',
        customerName: 'Ani Wijaya',
        customerPhone: '081209876543',
        category: 'Komputer/Laptop',
        deviceType: 'Laptop Dell XPS 15',
        damageType: 'Tidak bisa menyala',
        description: 'Mati total, tidak ada respon saat tombol power ditekan.',
        status: 'Pending',
    }
];

// A simple event emitter to notify subscribers of changes
type Listener = (entries: ServiceEntry[]) => void;
const listeners: Set<Listener> = new Set();

const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const notify = () => {
    listeners.forEach(listener => listener([...initialServiceEntries]));
};

export const serviceEntriesDB = {
    getAll: () => [...initialServiceEntries],
    getById: (id: string) => initialServiceEntries.find(entry => entry.id === id),
    add: (newEntryData: Omit<ServiceEntry, 'status' | 'id'> & { id: string }) => {
        const entryWithStatus: ServiceEntry = { ...newEntryData, status: 'Pending' };
        initialServiceEntries.push(entryWithStatus);
        notify();
    },
    update: (id: string, updatedData: Partial<ServiceEntry>) => {
        const index = initialServiceEntries.findIndex(e => e.id === id);
        if (index > -1) {
            initialServiceEntries[index] = { ...initialServiceEntries[index], ...updatedData };
            notify();
        }
    },
    subscribe,
};

// A hook to easily use the reactive data in components
export const useServiceEntries = () => {
    const [entries, setEntries] = useState(serviceEntriesDB.getAll());

    useEffect(() => {
        const unsubscribe = serviceEntriesDB.subscribe(setEntries);
        return () => unsubscribe();
    }, []);

    return entries;
};