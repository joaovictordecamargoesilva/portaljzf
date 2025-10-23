import React from 'react';
import { UserRole, User } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DocumentIcon, InvoiceIcon, TaskIcon } from './icons.tsx';

interface DashboardProps {
    user: User;
    setCurrentPage: (page: string) => void;
}

interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
    onClick?: () => void;
}

const adminData = {
  clientCount: 0,
  newRequests: 0,
  openInvoices: 0,
  invoicingData: [],
};

const clientData = {
  pendingTasks: 0,
  openInvoices: 0,
  newDocuments: 0,
};

const mockNotifications: any[] = [];

const StatCard: React.FC<StatCardProps> = ({ title, value, description, onClick }) => (
    <div
        className={`bg-white p-6 rounded-lg shadow-md ${onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.03] transition-all duration-200' : ''}`}
        onClick={onClick}
    >
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
);

const AdminDashboard: React.FC<{ setCurrentPage: (page: string) => void; }> = ({ setCurrentPage }) => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-gray-800">Dashboard do Administrador</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Total de Clientes" 
        value={adminData.clientCount} 
        description="Clientes ativos na plataforma" 
        onClick={() => setCurrentPage('client-registration')}
      />
      <StatCard 
        title="Novas Solicitações" 
        value={adminData.newRequests} 
        description="Documentos pendentes de revisão"
        onClick={() => setCurrentPage('documents')}
      />
      <StatCard 
        title="Cobranças em Aberto" 
        value={`R$ 0.00`} 
        description={`${adminData.openInvoices} faturas pendentes`}
        onClick={() => setCurrentPage('invoicing')}
      />
    </div>
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-gray-700 mb-4">Visão Geral de Faturamento (Últimos 6 meses)</h3>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={adminData.invoicingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pendente" fill="#ef4444" />
                <Bar dataKey="Recebido" fill="#22c55e" />
            </BarChart>
        </ResponsiveContainer>
    </div>
  </div>
);

const NotificationIcon: React.FC<{ icon: string }> = ({ icon }) => {
    const iconProps = { className: "w-5 h-5 text-gray-600" };
    switch (icon) {
        case 'invoice': return <InvoiceIcon {...iconProps} />;
        case 'document': return <DocumentIcon {...iconProps} />;
        case 'task': return <TaskIcon {...iconProps} />;
        default: return null;
    }
};

const ClientDashboard: React.FC<{ user: User, setCurrentPage: (page: string) => void; }> = ({ user, setCurrentPage }) => (
    <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Bem-vindo, {user.name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Tarefas Pendentes" 
                value={clientData.pendingTasks} 
                description="Ações necessárias este mês"
                onClick={() => setCurrentPage('tasks')}
            />
            <StatCard 
                title="Cobranças em Aberto" 
                value={clientData.openInvoices} 
                description="Faturas aguardando pagamento"
                onClick={() => setCurrentPage('invoicing')}
            />
            <StatCard 
                title="Novos Documentos" 
                value={clientData.newDocuments} 
                description="Documentos recebidos da JZF"
                onClick={() => setCurrentPage('documents')}
            />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-700 mb-4">Atividade Recente</h3>
            {mockNotifications.length > 0 ? (
                <ul className="space-y-4">
                    {mockNotifications.map(notification => (
                        <li key={notification.id} className="flex items-start space-x-3">
                            <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
                            <NotificationIcon icon={notification.icon} />
                            </div>
                            <div>
                                <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>{notification.text}</p>
                                <p className="text-xs text-gray-400">{notification.timestamp}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma atividade recente para exibir.</p>
                </div>
            )}
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ user, setCurrentPage }) => {
  return (
    <div>
        {user.role === UserRole.ADMIN ? <AdminDashboard setCurrentPage={setCurrentPage} /> : <ClientDashboard user={user} setCurrentPage={setCurrentPage}/>}
    </div>
  );
};

export default Dashboard;