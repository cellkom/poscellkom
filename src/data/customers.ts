export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
}

const initialCustomers: Customer[] = [
  { id: 'CUS001', name: 'Pelanggan Umum', phone: '-', address: '' },
  { id: 'CUS002', name: 'Budi Santoso', phone: '081234567890', address: 'Jl. Mawar No. 10' },
  { id: 'CUS003', name: 'Ani Wijaya', phone: '081209876543', address: 'Jl. Melati No. 5' },
];

type Listener = (customers: Customer[]) => void;
const listeners: Set<Listener> = new Set();

const notify = () => {
  listeners.forEach(listener => listener([...initialCustomers]));
};

export const customersDB = {
  getAll: () => [...initialCustomers],
  getById: (id: string) => initialCustomers.find(c => c.id === id),
  add: (newCustomerData: Omit<Customer, 'id'>) => {
    const newId = `CUS${(initialCustomers.length + 1).toString().padStart(3, '0')}`;
    const customerWithId: Customer = { ...newCustomerData, id: newId };
    initialCustomers.push(customerWithId);
    notify();
    return customerWithId;
  },
  update: (id: string, updatedData: Partial<Omit<Customer, 'id'>>) => {
    const index = initialCustomers.findIndex(c => c.id === id);
    if (index > -1) {
      initialCustomers[index] = { ...initialCustomers[index], ...updatedData };
      notify();
    }
  },
  delete: (id: string) => {
    const index = initialCustomers.findIndex(c => c.id === id);
    if (index > -1) {
        initialCustomers.splice(index, 1);
        notify();
    }
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
  },
};