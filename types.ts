export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
}

export interface User {
  id: string | number;
  name: string;
  login: string;
  email: string;
  role: UserRole;
  companyName?: string;
  taxRegime?: string;
  password?: string;
}

export interface Document {
  id: string | number;
  name: string;
  type: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  uploadDate: string;
  clientName?: string;
  uploadedBy?: 'Cliente' | 'Admin JZF';
}

export interface Invoice {
  id: string | number;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  clientName?: string;
}

export interface Recurrence {
  id: string;
  clientName: string;
  description: string;
  amount: number;
  billingDay: number;
  isActive: boolean;
}

export interface Task {
  id: string | number;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  clientName?: string;
}

export interface Client {
  id: string | number;
  companyName: string;
  email: string;
  phone: string;
  isActive: boolean;
  cnpj: string;
  taxRegime: string;
  certificateExpiration: string | null;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  restrictions: string[];
}

export interface TaxGuide {
  id: string;
  name: string;
  referenceMonth: string;
  issueDate: string;
  downloadUrl: string;
  regime: 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real' | 'Todos';
}