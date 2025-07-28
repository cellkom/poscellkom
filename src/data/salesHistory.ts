import { useState, useEffect } from 'react';

// --- Type Definitions ---
export interface CartItemForHistory {
  id: string;
  name: string;
  quantity: number;
  buyPrice: number;
  salePrice: number;
}

export interface SaleTransaction {
  id: string;
  items: CartItemForHistory[];
  summary: { totalSale: number; totalCost: number; profit: number; };
  customerName: string;
  paymentMethod: 'tunai' | 'cicilan';
  date: Date;
  paymentAmount: number;
  remainingAmount: number;
}

// --- Mock Database ---
// Adding some initial data for demonstration purposes
const salesHistory: SaleTransaction[] = [
    {
        id: 'TRX-1710000000000',
        items: [{ id: 'BRG001', name: 'LCD iPhone X', quantity: 1, buyPrice: 650000, salePrice: 850000 }],
        summary: { totalSale: 850000, totalCost: 650000, profit: 200000 },
        customerName: 'Budi Santoso',
        paymentMethod: 'tunai',
        date: new Date(new Date().setDate(new Date().getDate() - 5)),
        paymentAmount: 850000,
        remainingAmount: 0,
    },
    {
        id: 'TRX-1710000000001',
        items: [{ id: 'BRG003', name: 'Charger Type-C 25W', quantity: 2, buyPrice: 80000, salePrice: 150000 }],
        summary: { totalSale: 300000, totalCost: 160000, profit: 140000 },
        customerName: 'Ani Wijaya',
        paymentMethod: 'tunai',
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        paymentAmount: 300000,
        remainingAmount: 0,
    }
];

// --- Listener/Subscriber Pattern for State Management ---
type Listener = (history: SaleTransaction[]) => void;
const listeners: Set<Listener> = new Set();

const notify = () => {
    listeners.forEach(listener => listener([...salesHistory]));
};

export const salesHistoryDB = {
    getAll: () => [...salesHistory],
    add: (transaction: SaleTransaction) => {
        salesHistory.unshift(transaction); // Add to the beginning
        notify();
    },
    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};

// --- React Hook for easy data access ---
export const useSalesHistory = () => {
    const [history, setHistory] = useState(salesHistoryDB.getAll());

    useEffect(() => {
        const unsubscribe = salesHistoryDB.subscribe(setHistory);
        return () => unsubscribe();
    }, []);

    return history;
};