import { useState, useEffect } from 'react';
import { installmentsDB } from '@/data/installments';

// --- React Hook for easy data access ---
export const useInstallments = () => {
    const [installments, setInstallments] = useState(installmentsDB.getAll());

    useEffect(() => {
        const unsubscribe = installmentsDB.subscribe(setInstallments);
        return () => unsubscribe();
    }, []);

    return installments;
};