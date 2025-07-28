// --- Type Definitions ---
export interface UsedPartForHistory {
  id: string;
  name: string;
  quantity: number;
  buyPrice: number;
  retailPrice: number;
}

export interface ServiceTransaction {
  id: string; // service entry ID
  date: Date;
  customerName: string;
  description: string;
  usedParts: UsedPartForHistory[];
  serviceFee: number;
  total: number;
  paymentAmount: number;
  remainingAmount: number;
}

// --- Mock Database ---
const serviceHistory: ServiceTransaction[] = [];

// --- Listener/Subscriber Pattern for State Management ---
type Listener = (history: ServiceTransaction[]) => void;
const listeners: Set<Listener> = new Set();

const notify = () => {
    listeners.forEach(listener => listener([...serviceHistory]));
};

export const serviceHistoryDB = {
    getAll: () => [...serviceHistory],
    add: (transaction: ServiceTransaction) => {
        serviceHistory.unshift(transaction);
        notify();
    },
    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
};