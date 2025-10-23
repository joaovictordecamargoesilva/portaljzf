import React, { useState } from 'react';
import { UserRole, User } from './types.ts';
import { users } from './data/mockData.ts';

import LoginPage from './components/LoginPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import DocumentsPage from './components/DocumentsPage.tsx';
import InvoicingPage from './components/InvoicingPage.tsx';
import TasksPage from './components/TasksPage.tsx';
import PayrollPage from './components/PayrollPage.tsx';
import CompliancePage from './components/CompliancePage.tsx';
import SimulationPage from './components/SimulationPage.tsx';
import TaxGuidesPage from './components/TaxGuidesPage.tsx';
import VirtualAssistant from './components/VirtualAssistant.tsx';
import ClientRegistrationPage from './components/ClientRegistrationPage.tsx';
import SettingsPage from './components/SettingsPage.tsx';

import { 
    DashboardIcon, DocumentIcon, InvoiceIcon, TaskIcon, PayrollIcon, 
    ComplianceIcon, SimulationIcon, TaxIcon, LogoutIcon, ClientRegistrationIcon,
    SettingsIcon
} from './components/icons.tsx';

interface NavItem {
    id: string;
    label: string;
    icon: React.FC<{ className: string }>;
}

const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'documents', label: 'Documentos', icon: DocumentIcon },
    { id: 'invoicing', label: 'Cobranças', icon: InvoiceIcon },
    { id: 'tasks', label: 'Tarefas de Clientes', icon: TaskIcon },
    { id: 'client-registration', label: 'Clientes', icon: ClientRegistrationIcon },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
];

const clientNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'documents', label: 'Documentos', icon: DocumentIcon },
    { id: 'invoicing', label: 'Minhas Cobranças', icon: InvoiceIcon },
    { id: 'tasks', label: 'Minhas Tarefas', icon: TaskIcon },
    { id: 'payroll', label: 'Folha de Ponto', icon: PayrollIcon },
    { id: 'compliance', label: 'Consulta de Pendências', icon: ComplianceIcon },
    { id: 'simulation', label: 'Simulação de Cenário', icon: SimulationIcon },
    { id: 'tax-guides', label: 'Geração de Guias', icon: TaxIcon },
];

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<string>('dashboard');

    if (!user) {
        return <LoginPage onLogin={setUser} users={users} />;
    }

    const navItems = user.role === UserRole.ADMIN ? adminNavItems : clientNavItems;

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard user={user} setCurrentPage={setCurrentPage} />;
            case 'documents': return <DocumentsPage user={user}/>;
            case 'invoicing': return <InvoicingPage user={user}/>;
            case 'tasks': return <TasksPage user={user}/>;
            case 'payroll': return <PayrollPage />;
            case 'compliance': return <CompliancePage />;
            case 'simulation': return <SimulationPage />;
            case 'tax-guides': return <TaxGuidesPage user={user} />;
            case 'client-registration': return <ClientRegistrationPage />;
            case 'settings': return <SettingsPage />;
            default: return <Dashboard user={user} setCurrentPage={setCurrentPage} />;
        }
    };

    return (
        <div className="flex h-screen bg-brand-secondary">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-primary text-white flex flex-col">
                <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-white/20">
                    Portal JZF
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentPage(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md text-left transition-colors ${
                                currentPage === item.id ? 'bg-white/20' : 'hover:bg-white/10'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/20">
                     <button
                        onClick={() => setUser(null)}
                        className="w-full flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-white/10 transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white shadow-md flex items-center justify-between px-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 capitalize">{currentPage.replace('-', ' ')}</h1>
                    </div>
                    <div className="text-right">
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.role === UserRole.ADMIN ? 'Administrador' : user.companyName}</div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    {renderPage()}
                </main>
            </div>
            {user.role === UserRole.CLIENT && <VirtualAssistant />}
        </div>
    );
};

export default App;
