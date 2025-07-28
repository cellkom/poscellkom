export type ServiceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface ServiceEntry {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string | null;
  device_type: string;
  serial_number: string | null;
  problem_description: string;
  equipment_received: string | null;
  estimated_cost: number;
  technician: string | null;
  status: ServiceStatus;
}