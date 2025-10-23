import { User, UserRole, Client, Document, Invoice, Task } from '../types.ts';

export const users: User[] = [
    { 
      id: 'client01', 
      name: 'João da Silva (Empresa Exemplo)', 
      login: 'exemplo',
      email: 'contato@exemplo.com', 
      role: UserRole.CLIENT, 
      companyName: 'Empresa Exemplo Ltda',
      taxRegime: 'Simples Nacional',
      password: '123456',
    },
    { 
      id: 'client02', 
      name: 'Maria Oliveira (Soluções Inovadoras)', 
      login: 'solucoes',
      email: 'financeiro@solucoes.com', 
      role: UserRole.CLIENT, 
      companyName: 'Soluções Inovadoras S.A.',
      taxRegime: 'Lucro Presumido',
      password: '123456',
    },
    { 
      id: 'admin01', 
      name: 'Admin JZF', 
      login: 'admin',
      email: 'admin@jzf.com', 
      role: UserRole.ADMIN,
      password: 'admin',
    },
];

export const clients: Client[] = [
    { 
      id: 'client01', 
      companyName: 'Empresa Exemplo Ltda', 
      email: 'contato@exemplo.com', 
      phone: '(11) 98765-4321', 
      isActive: true,
      cnpj: '12.345.678/0001-90',
      taxRegime: 'Simples Nacional',
      certificateExpiration: '15/10/2024',
    },
    { 
      id: 'client02', 
      companyName: 'Soluções Inovadoras S.A.', 
      email: 'financeiro@solucoes.com', 
      phone: '(21) 91234-5678', 
      isActive: true,
      cnpj: '98.765.432/0001-10',
      taxRegime: 'Lucro Presumido',
      certificateExpiration: '01/03/2025',
    },
    { 
      id: 'client03', 
      companyName: 'Comércio Varejista ABC', 
      email: 'compras@varejoabc.com', 
      phone: '(31) 99999-8888', 
      isActive: false,
      cnpj: '55.444.333/0001-22',
      taxRegime: 'Simples Nacional',
      certificateExpiration: null,
    },
];

export const documents: Document[] = [
    { id: 1, name: 'Contrato Social.pdf', type: 'Societário', status: 'Approved', uploadDate: '2024-06-15', clientName: 'Empresa Exemplo Ltda', uploadedBy: 'Cliente' },
    { id: 2, name: 'NF-e Junho.xml', type: 'Fiscal', status: 'Pending', uploadDate: '2024-07-01', clientName: 'Empresa Exemplo Ltda', uploadedBy: 'Cliente' },
    { id: 3, name: 'Balanço 2023.xlsx', type: 'Contábil', status: 'Approved', uploadDate: '2024-04-10', clientName: 'Soluções Inovadoras S.A.', uploadedBy: 'Admin JZF' },
    { id: 4, name: 'Procuração RFB.pdf', type: 'Societário', status: 'Rejected', uploadDate: '2024-06-20', clientName: 'Soluções Inovadoras S.A.', uploadedBy: 'Cliente' },
];

export const invoices: Invoice[] = [
    { id: 1, description: 'Honorários Contábeis - Junho/2024', amount: 1250.00, dueDate: '2024-07-10', status: 'Pending', clientName: 'Empresa Exemplo Ltda' },
    { id: 2, description: 'Honorários Contábeis - Maio/2024', amount: 1250.00, dueDate: '2024-06-10', status: 'Paid', clientName: 'Empresa Exemplo Ltda' },
    { id: 3, description: 'Consultoria Tributária', amount: 3500.00, dueDate: '2024-07-01', status: 'Overdue', clientName: 'Soluções Inovadoras S.A.' },
    { id: 4, description: 'Honorários Contábeis - Junho/2024', amount: 2800.00, dueDate: '2024-07-10', status: 'Pending', clientName: 'Soluções Inovadoras S.A.' },
];

export const tasks: Task[] = [
    { id: 1, title: 'Enviar extratos bancários de Junho', description: 'Por favor, envie todos os extratos bancários consolidados do mês de Junho.', dueDate: '2024-07-05', completed: false, clientName: 'Empresa Exemplo Ltda' },
    { id: 2, title: 'Assinar alteração contratual', description: 'A minuta da alteração foi enviada por email, favor assinar digitalmente.', dueDate: '2024-07-15', completed: false, clientName: 'Soluções Inovadoras S.A.' },
    { id: 3, title: 'Renovar Certificado Digital', description: 'Seu certificado digital A1 vence em breve, precisamos renová-lo.', dueDate: '2024-08-30', completed: false, clientName: 'Empresa Exemplo Ltda' },
    { id: 4, title: 'Confirmar pró-labore dos sócios', description: 'Enviar valores de retirada para o mês de Junho.', dueDate: '2024-07-01', completed: true, clientName: 'Soluções Inovadoras S.A.' },
];