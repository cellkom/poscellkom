// --- Type Definitions ---
export interface Payment {
  date: Date;
  amount: number;
}

export interface Installment {
  id: string; // Original transaction ID
  type: 'Penjualan' | 'Servis';
  customerName: string;
  transactionDate: Date;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Belum Lunas' | 'Lunas';
  paymentHistory: Payment[];
  details: string;
}

interface NewInstallmentData {
  id: string;
  type: 'Penjualan' | 'Servis';
  customerName: string;
  transactionDate: Date;
  totalAmount: number;
  initialPayment: number;
  details: string;
}

// --- Mock Database ---
const initialInstallments: Installment[] = [
    // Example data, will be populated from Sales/Service pages
];

// --- Listener/Subscriber Pattern for State Management ---
type Listener = (installments: Installment[]) => void;
const listeners: Set<Listener> = new Set();

const notify = () => {
    listeners.forEach(listener => listener([...initialInstallments]));
};

// --- Database Actions ---
export const installmentsDB = {
    getAll: () => [...initialInstallments],

    getById: (id: string) => initialInstallments.find(inst => inst.id === id),

    add: (data: NewInstallmentData) => {
        const existing = initialInstallments.find(inst => inst.id === data.id);
        if (existing) return; // Avoid duplicates

        const newInstallment: Installment = {
            id: data.id,
            type: data.type,
            customerName: data.customerName,
            transactionDate: data.transactionDate,
            totalAmount: data.totalAmount,
            paidAmount: data.initialPayment,
            remainingAmount: data.totalAmount - data.initialPayment,
            status: (data.totalAmount - data.initialPayment) > 0 ? 'Belum Lunas' : 'Lunas',
            paymentHistory: [{ date: new Date(), amount: data.initialPayment }],
            details: data.details,
        };
        initialInstallments.push(newInstallment);
        notify();
    },

    addPayment: (id: string, paymentAmount: number) => {
        const index = initialInstallments.findIndex(inst => inst.id === id);
        if (index > -1) {
            const installment = initialInstallments[index];
            installment.paidAmount += paymentAmount;
            installment.remainingAmount -= paymentAmount;
            installment.paymentHistory.push({ date: new Date(), amount: paymentAmount });

            if (installment.remainingAmount <= 0) {
                installment.status = 'Lunas';
                installment.remainingAmount = 0; // Ensure it doesn't go negative
            }
            notify();
        }
    },
    
    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};