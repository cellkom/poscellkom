import { useState, useEffect } from 'react';
import { customersDB, Customer } from '@/data/customers';

export const useCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>(customersDB.getAll());

    useEffect(() => {
        const unsubscribe = customersDB.subscribe(setCustomers);
        return unsubscribe;
    }, []);

    return customers;
};