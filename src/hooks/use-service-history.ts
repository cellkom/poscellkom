import { useState, useEffect } from 'react';
import { serviceHistoryDB, ServiceTransaction } from '@/data/serviceHistory';

export const useServiceHistory = () => {
    const [history, setHistory] = useState<ServiceTransaction[]>(serviceHistoryDB.getAll());

    useEffect(() => {
        const unsubscribe = serviceHistoryDB.subscribe(setHistory);
        return unsubscribe;
    }, []);

    return history;
};