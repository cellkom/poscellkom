import { useState, useEffect } from 'react';
import { suppliersDB, Supplier } from '@/data/suppliers';

export const useSuppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>(suppliersDB.getAll());

    useEffect(() => {
        const unsubscribe = suppliersDB.subscribe(setSuppliers);
        return unsubscribe;
    }, []);

    return suppliers;
};