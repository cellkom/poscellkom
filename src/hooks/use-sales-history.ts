import { useState, useEffect } from 'react';
import { salesHistoryDB, SaleTransaction } from '@/data/salesHistory';

export const useSalesHistory = () => {
    const [history, setHistory] = useState<SaleTransaction[]>(salesHistoryDB.getAll());

    useEffect(() => {
        const unsubscribe = salesHistoryDB.subscribe(setHistory);
        return unsubscribe;
    }, []);

    return history;
};