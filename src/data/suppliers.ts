export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

const initialSuppliers: Supplier[] = [
  { id: 'SUP001', name: 'PT Jaya Abadi', phone: '081234567890', address: 'Jl. Elektronik No. 1' },
  { id: 'SUP002', name: 'CV Mitra Perkasa', phone: '081209876543', address: 'Jl. Gadget No. 2' },
];

type Listener = (suppliers: Supplier[]) => void;
const listeners: Set<Listener> = new Set();

const notify = () => {
  listeners.forEach(listener => listener([...initialSuppliers]));
};

export const suppliersDB = {
  getAll: () => [...initialSuppliers],
  getById: (id: string) => initialSuppliers.find(s => s.id === id),
  add: (newSupplierData: Omit<Supplier, 'id'>) => {
    const newId = `SUP${(initialSuppliers.length + 1).toString().padStart(3, '0')}`;
    const supplierWithId: Supplier = { ...newSupplierData, id: newId };
    initialSuppliers.push(supplierWithId);
    notify();
    return supplierWithId;
  },
  update: (id: string, updatedData: Partial<Omit<Supplier, 'id'>>) => {
    const index = initialSuppliers.findIndex(s => s.id === id);
    if (index > -1) {
      initialSuppliers[index] = { ...initialSuppliers[index], ...updatedData };
      notify();
    }
  },
  delete: (id: string) => {
    const index = initialSuppliers.findIndex(s => s.id === id);
    if (index > -1) {
        initialSuppliers.splice(index, 1);
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