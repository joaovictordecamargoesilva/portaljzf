import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, User, Invoice, Recurrence } from '../types.ts';

const StatusBadge: React.FC<{ status: Invoice['status'] }> = ({ status }) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusClasses = {
        Paid: "bg-green-100 text-green-800",
        Pending: "bg-yellow-100 text-yellow-800",
        Overdue: "bg-red-100 text-red-800",
    };
    const statusText = {
        Paid: "Pago",
        Pending: "Pendente",
        Overdue: "Vencido",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{statusText[status]}</span>;
}

const PaymentModal: React.FC<{ invoice: Invoice, onClose: () => void }> = ({ invoice, onClose }) => {
    const [copied, setCopied] = useState('');

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(''), 2000); // Reset after 2 seconds
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Opções de Pagamento</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-600">{invoice.description}</p>
                        <p className="text-2xl font-bold text-gray-900">R$ {invoice.amount.toFixed(2)}</p>
                    </div>
                    <button onClick={() => handleCopy('00020126...PIX_CODE...5303986', 'pix')} className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm font-medium text-center relative">
                        {copied === 'pix' ? 'Copiado!' : 'Copiar Código PIX'}
                    </button>
                    <button onClick={() => handleCopy(`https://pagamento.jzf.com.br/inv/${invoice.id}`, 'link')} className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm font-medium text-center relative">
                         {copied === 'link' ? 'Copiado!' : 'Copiar Link de Pagamento'}
                    </button>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Boleto aberto em nova aba.'); }} target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm font-medium text-center">
                        Abrir Boleto
                    </a>
                </div>
                 <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">Fechar</button>
                </div>
            </div>
        </div>
    );
};

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Fix: Changed id type to string | number to match the Invoice interface.
    onSubmit: (data: Omit<Invoice, 'id' | 'status'>, id?: string | number) => void;
    initialData: Invoice | null;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setClientName(initialData.clientName!);
      setDescription(initialData.description);
      setAmount(String(initialData.amount));
      setDueDate(initialData.dueDate);
    } else {
      setClientName('');
      setDescription('');
      setAmount('');
      setDueDate('');
    }
  }, [initialData, isOpen]);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !description || !amount || !dueDate) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    onSubmit({
      clientName,
      description,
      amount: parseFloat(amount),
      dueDate,
    }, initialData?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Editar Cobrança' : 'Criar Nova Cobrança'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Cliente</label>
              <input type="text" id="clientName" value={clientName} placeholder="Nome da empresa cliente" onChange={(e) => setClientName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
              <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
              <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm">Salvar Cobrança</button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface CreateRecurrenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Recurrence, 'id' | 'isActive'>, id?: string) => void;
    initialData: Recurrence | null;
}

const CreateRecurrenceModal: React.FC<CreateRecurrenceModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDay, setBillingDay] = useState('1');

  useEffect(() => {
      if (initialData) {
          setClientName(initialData.clientName);
          setDescription(initialData.description);
          setAmount(String(initialData.amount));
          setBillingDay(String(initialData.billingDay));
      } else {
          setClientName('');
          setDescription('Honorários Contábeis');
          setAmount('');
          setBillingDay('1');
      }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !description || !amount || !billingDay) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    onSubmit({
      clientName,
      description,
      amount: parseFloat(amount),
      billingDay: parseInt(billingDay, 10),
    }, initialData?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Editar Recorrência' : 'Criar Nova Recorrência'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">Crie um modelo para gerar cobranças automaticamente todo mês.</p>
            <div>
              <label htmlFor="rec-clientName" className="block text-sm font-medium text-gray-700">Cliente</label>
              <input type="text" id="rec-clientName" value={clientName} placeholder="Nome da empresa cliente" onChange={(e) => setClientName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="rec-description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <input type="text" id="rec-description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label htmlFor="rec-amount" className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                <input type="number" id="rec-amount" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                <div>
                <label htmlFor="rec-billingDay" className="block text-sm font-medium text-gray-700">Dia da Geração</label>
                <input type="number" id="rec-billingDay" value={billingDay} onChange={(e) => setBillingDay(e.target.value)} min="1" max="28" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm">Salvar Recorrência</button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface ManageRecurrencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    recurrences: Recurrence[];
    onCreateNew: () => void;
    onEdit: (rec: Recurrence) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string) => void;
}

const ManageRecurrencesModal: React.FC<ManageRecurrencesModalProps> = ({
  isOpen,
  onClose,
  recurrences,
  onCreateNew,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Gerenciar Cobranças Recorrentes</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="flex justify-end mb-4">
                        <button onClick={onCreateNew} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Criar Nova Recorrência</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dia Geração</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {recurrences.map(rec => (
                               <tr key={rec.id}>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{rec.clientName}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.description}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {rec.amount.toFixed(2)}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Todo dia {rec.billingDay}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm">
                                       <button onClick={() => onToggleStatus(rec.id)} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rec.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                                           {rec.isActive ? 'Ativa' : 'Inativa'}
                                       </button>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                       <button onClick={() => onEdit(rec)} className="text-brand-primary hover:text-opacity-80">Editar</button>
                                       <button onClick={() => onDelete(rec.id)} className="text-red-600 hover:text-red-800">Excluir</button>
                                   </td>
                               </tr>
                           ))}
                           {recurrences.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-sm text-gray-500">Nenhum modelo de recorrência cadastrado.</td>
                                </tr>
                           )}
                        </tbody>
                        </table>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">Fechar</button>
                </div>
            </div>
        </div>
    )
};


const InvoicingPage: React.FC<{ user: User }> = ({ user }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<Recurrence[]>([]);
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isRecurrenceModalOpen, setRecurrenceModalOpen] = useState(false);
  const [isCreateRecurrenceModalOpen, setCreateRecurrenceModalOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingRecurrence, setEditingRecurrence] = useState<Recurrence | null>(null);

  const [activeTab, setActiveTab] = useState('pending');
  
  // Simulate recurring invoice generation on component mount
  useEffect(() => {
    if (user.role !== UserRole.ADMIN || recurringInvoices.length === 0) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const newInvoicesFromRecurrence: Invoice[] = [];

    recurringInvoices.forEach(rec => {
        if (!rec.isActive) return;

        const alreadyExists = invoices.some(inv => 
            inv.clientName === rec.clientName && 
            inv.description.startsWith(rec.description) && 
            new Date(inv.dueDate).getMonth() === currentMonth &&
            new Date(inv.dueDate).getFullYear() === currentYear
        );

        if (!alreadyExists) {
            const dueDate = new Date(currentYear, currentMonth, rec.billingDay + 10);
            newInvoicesFromRecurrence.push({
                id: `inv-${Date.now()}-${rec.id}`,
                clientName: rec.clientName,
                description: `${rec.description} Ref. ${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`,
                amount: rec.amount,
                dueDate: dueDate.toISOString().split('T')[0],
                status: 'Pending'
            });
        }
    });

    if (newInvoicesFromRecurrence.length > 0) {
        setInvoices(prev => [...newInvoicesFromRecurrence, ...prev]);
        alert(`${newInvoicesFromRecurrence.length} cobrança(s) recorrente(s) foi/foram gerada(s) para o mês atual.`);
    }
  }, []); // Run only once

  const userInvoices = useMemo(() => 
    user.role === UserRole.CLIENT ? invoices.filter(inv => inv.clientName === user.companyName) : invoices
  , [invoices, user]);
  
  const pendingInvoices = useMemo(() =>
    userInvoices.filter(inv => inv.status === 'Pending' || inv.status === 'Overdue'),
    [userInvoices]
  );

  const paidInvoices = useMemo(() =>
    userInvoices.filter(inv => inv.status === 'Paid'),
    [userInvoices]
  );
  
  const invoicesToDisplay = activeTab === 'pending' ? pendingInvoices : paidInvoices;

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };
  
  const handleOpenCreateInvoiceModal = (invoice: Invoice | null) => {
    setEditingInvoice(invoice);
    setCreateModalOpen(true);
  };
  
  // Fix: Changed id type to string | number to match the Invoice interface.
  const handleSaveInvoice = (data: Omit<Invoice, 'id' | 'status'>, id?: string | number) => {
    if (id) {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...data } : inv));
        alert('Cobrança atualizada com sucesso!');
    } else {
        const newInvoice: Invoice = {
            ...data,
            id: (invoices.length + 1).toString(),
            status: 'Pending',
        };
        setInvoices(prev => [newInvoice, ...prev]);
        alert('Cobrança criada com sucesso!');
    }
    setCreateModalOpen(false);
    setActiveTab('pending');
  };

  // Fix: Changed id type to string | number to match the Invoice interface.
  const handleDeleteInvoice = (id: string | number) => {
    if (window.confirm('Tem certeza que deseja excluir esta cobrança?')) {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  // Fix: Changed id type to string | number to match the Invoice interface.
  const handleUpdateInvoiceStatus = (id: string | number, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };
  
  // --- Recurrence Handlers ---
  const handleOpenCreateRecurrenceModal = (recurrence: Recurrence | null) => {
    setEditingRecurrence(recurrence);
    setCreateRecurrenceModalOpen(true);
  };

  const handleSaveRecurrence = (data: Omit<Recurrence, 'id' | 'isActive'>, id?: string) => {
    if (id) {
        setRecurringInvoices(prev => prev.map(rec => rec.id === id ? { ...rec, ...data } : rec));
        alert('Recorrência atualizada com sucesso!');
    } else {
        const newRecurrence: Recurrence = {
            ...data,
            id: `rec-${Date.now()}`,
            isActive: true,
        };
        setRecurringInvoices(prev => [newRecurrence, ...prev]);
        alert('Modelo de recorrência criado com sucesso!');
    }
    setCreateRecurrenceModalOpen(false);
  };

  const handleDeleteRecurrence = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este modelo de recorrência?')) {
        setRecurringInvoices(prev => prev.filter(rec => rec.id !== id));
    }
  };

  const handleToggleRecurrenceStatus = (id: string) => {
    setRecurringInvoices(prev => prev.map(rec => rec.id === id ? { ...rec, isActive: !rec.isActive } : rec));
  };


  const TabButton: React.FC<{label: string, tabName: string, count: number}> = ({
    label,
    tabName,
    count,
  }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
        activeTab === tabName
          ? 'border-brand-primary text-brand-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label} <span className="bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 ml-2 text-xs">{count}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Cobranças</h2>
        {user.role === UserRole.ADMIN && (
          <div className="flex space-x-2">
              <button onClick={() => setRecurrenceModalOpen(true)} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">Gerenciar Recorrências</button>
              <button onClick={() => handleOpenCreateInvoiceModal(null)} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm">Criar Nova Cobrança</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <TabButton label="Cobranças Pendentes" tabName="pending" count={pendingInvoices.length} />
                  <TabButton label="Histórico de Pagamentos" tabName="history" count={paidInvoices.length} />
              </nav>
            </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  {user.role === UserRole.ADMIN && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoicesToDisplay.map((invoice) => (
                  <tr key={invoice.id}>
                    {/* Fix: Converted invoice.id to string before using padStart. */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{invoice.id.toString().padStart(4, '0')}</td>
                    {user.role === UserRole.ADMIN && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.clientName}</td>}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {invoice.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {user.role === UserRole.ADMIN ? (
                         <select 
                           value={invoice.status} 
                           onChange={(e) => handleUpdateInvoiceStatus(invoice.id, e.target.value as Invoice['status'])}
                           className="text-xs p-1 rounded border-gray-300"
                         >
                           <option value="Pending">Pendente</option>
                           <option value="Paid">Pago</option>
                           <option value="Overdue">Vencido</option>
                         </select>
                       ) : <StatusBadge status={invoice.status} />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {invoice.status !== 'Paid' && user.role === UserRole.CLIENT && (
                          <button onClick={() => handleOpenPaymentModal(invoice)} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-xs">Pagar</button>
                      )}
                      {user.role === UserRole.ADMIN && (
                           <>
                             <button onClick={() => handleOpenCreateInvoiceModal(invoice)} className="text-brand-primary hover:text-opacity-80">Editar</button>
                             <button onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-600 hover:text-red-800">Excluir</button>
                           </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             {invoicesToDisplay.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>Nenhuma cobrança encontrada nesta categoria.</p>
                </div>
            )}
          </div>
        </div>
      </div>
      {isPaymentModalOpen && selectedInvoice && (
        <PaymentModal invoice={selectedInvoice} onClose={() => setPaymentModalOpen(false)} />
      )}
      <CreateInvoiceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleSaveInvoice}
        initialData={editingInvoice}
      />
      {user.role === UserRole.ADMIN && (
          <>
            <ManageRecurrencesModal 
                isOpen={isRecurrenceModalOpen}
                onClose={() => setRecurrenceModalOpen(false)}
                recurrences={recurringInvoices}
                onCreateNew={() => {
                    setRecurrenceModalOpen(false);
                    handleOpenCreateRecurrenceModal(null);
                }}
                onEdit={(rec) => {
                    setRecurrenceModalOpen(false);
                    handleOpenCreateRecurrenceModal(rec);
                }}
                onDelete={handleDeleteRecurrence}
                onToggleStatus={handleToggleRecurrenceStatus}
            />
            <CreateRecurrenceModal
                isOpen={isCreateRecurrenceModalOpen}
                onClose={() => setCreateRecurrenceModalOpen(false)}
                onSubmit={handleSaveRecurrence}
                initialData={editingRecurrence}
            />
          </>
      )}
    </div>
  );
};

export default InvoicingPage;