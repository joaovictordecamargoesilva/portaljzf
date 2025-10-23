import React, { useState, useEffect } from 'react';
import { Admin } from '../types.ts';

const initialAdmins: Admin[] = [
    { id: 'admin01', name: 'Admin JZF', email: 'admin@jzf.com', restrictions: [] },
];

const allAdminPages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'documents', label: 'Documentos' },
    { id: 'invoicing', label: 'Cobranças' },
    { id: 'tasks', label: 'Tarefas de Clientes' },
    { id: 'client-registration', label: 'Clientes' },
    { id: 'settings', label: 'Configurações' },
];

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
}

// Reusable Modal Component
const Modal: React.FC<ModalProps> = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white rounded-t-lg">
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <button onClick={onClose} aria-label="Fechar" className="text-gray-500 hover:text-gray-900 text-3xl font-light">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
        </div>
    </div>
);

const SettingsPage: React.FC = () => {
    const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [restrictions, setRestrictions] = useState<string[]>([]);

    useEffect(() => {
        if (isModalOpen) {
            if (editingAdmin) {
                setName(editingAdmin.name);
                setEmail(editingAdmin.email);
                setRestrictions(editingAdmin.restrictions);
                setPassword('');
                setConfirmPassword('');
            } else {
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setRestrictions([]);
            }
        }
    }, [isModalOpen, editingAdmin]);

    const handleOpenModal = (admin: Admin | null) => {
        setEditingAdmin(admin);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAdmin(null);
    };

    const handleRestrictionChange = (pageId: string) => {
        setRestrictions(prev => 
            prev.includes(pageId) 
                ? prev.filter(p => p !== pageId) 
                : [...prev, pageId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        if (!editingAdmin && (!password || password.length < 6)) {
            alert('A senha é obrigatória e deve ter no mínimo 6 caracteres.');
            return;
        }

        const adminData = { name, email, restrictions };

        if (editingAdmin) {
            setAdmins(prev => prev.map(admin => admin.id === editingAdmin.id ? { ...admin, ...adminData } : admin));
            alert('Administrador atualizado com sucesso.');
        } else {
            const newAdmin: Admin = {
                id: `admin${Date.now()}`,
                ...adminData,
            };
            setAdmins(prev => [...prev, newAdmin]);
            alert('Administrador criado com sucesso.');
        }
        handleCloseModal();
    };

    const handleDeleteAdmin = (id: string) => {
        if (admins.length <= 1) {
            alert('Não é possível excluir o único administrador.');
            return;
        }
        if (window.confirm('Tem certeza de que deseja excluir este administrador?')) {
            setAdmins(prev => prev.filter(admin => admin.id !== id));
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciar Administradores</h2>
                <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm">
                    Adicionar Administrador
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restrições</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map((admin) => (
                                <tr key={admin.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {admin.restrictions.length > 0 ? `${admin.restrictions.length} página(s)` : 'Nenhuma'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenModal(admin)} className="text-brand-primary hover:text-opacity-80">Editar</button>
                                        <button onClick={() => handleDeleteAdmin(admin.id)} className="text-red-600 hover:text-red-800" disabled={admins.length <= 1}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <Modal title={editingAdmin ? "Editar Administrador" : "Adicionar Administrador"} onClose={handleCloseModal}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha {editingAdmin && '(Deixe em branco para não alterar)'}</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!editingAdmin} minLength={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required={!editingAdmin || !!password} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                        
                        <div>
                            <h4 className="text-sm font-medium text-gray-700">Restringir Acesso a Páginas</h4>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {allAdminPages.map(page => (
                                    <div key={page.id} className="flex items-center">
                                        <input
                                            id={`page-${page.id}`}
                                            type="checkbox"
                                            checked={restrictions.includes(page.id)}
                                            onChange={() => handleRestrictionChange(page.id)}
                                            className="h-4 w-4 text-brand-primary rounded border-gray-300 focus:ring-brand-primary"
                                        />
                                        <label htmlFor={`page-${page.id}`} className="ml-2 block text-sm text-gray-900">{page.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-5 flex justify-end space-x-3">
                            <button type="button" onClick={handleCloseModal} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90">Salvar</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default SettingsPage;