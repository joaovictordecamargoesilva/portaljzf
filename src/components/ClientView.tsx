
import React, { useState, useMemo } from 'react';
import { Client, User, TaskTemplateSet, UserRole, TaxRegime } from '../types';
import Icon from './Icon';
import Modal from './Modal';
import * as api from '../services/api';
import { View } from '../App';

interface ClientViewProps {
    clients: Client[];
    users: User[];
    currentUser: User;
    addNotification: (notification: any) => void;
    taskTemplateSets: TaskTemplateSet[];
    onSave: (clientData: any, isEditing: boolean) => Promise<void>;
    onInactivate: (clientId: number) => Promise<void>;
    onDelete: (clientId: number) => Promise<void>;
    setIsLoading: (loading: boolean) => void;
    setCurrentView: (view: View) => void;
    setViewingClientId: (id: number | null) => void;
}

const ClientView: React.FC<ClientViewProps> = ({
    clients,
    users,
    currentUser,
    addNotification,
    taskTemplateSets,
    onSave,
    onInactivate,
    onDelete,
    setIsLoading,
    setCurrentView,
    setViewingClientId,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        return clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.cnpj?.includes(searchTerm)
        );
    }, [clients, searchTerm]);

    const handleOpenModal = (client: Client | null = null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleViewDashboard = (clientId: number) => {
        setViewingClientId(clientId);
        setCurrentView('client-dashboard');
    };

    const handleSave = async (clientData: any) => {
        await onSave(clientData, !!editingClient);
        setIsModalOpen(false);
    };

    const ClientForm: React.FC<{
        client: Client | null;
        onSave: (data: any) => void;
        onCancel: () => void;
    }> = ({ client, onSave, onCancel }) => {
        const clientUser = useMemo(() => users.find(u => u.clientIds.includes(client?.id ?? -1) && u.role === 'Cliente'), [client, users]);

        const [formData, setFormData] = useState({
            id: client?.id,
            name: client?.name || '',
            company: client?.company || '',
            cnpj: client?.cnpj || '',
            email: client?.email || '',
            phone: client?.phone || '',
            taxRegime: client?.taxRegime || 'SimplesNacional',
            cnaes: client?.cnaes.join(', ') || '',
            keywords: client?.keywords.join(', ') || '',
            businessDescription: client?.businessDescription || '',
            username: clientUser?.username || '',
            password: '',
            taskTemplateSetId: '',
            userId: clientUser?.id,
            selectedClientIds: clientUser?.clientIds || [],
        });
        const [showCnpjSpinner, setShowCnpjSpinner] = useState(false);
        const [cnpjError, setCnpjError] = useState('');

        const handleCnpjLookup = async () => {
            if (formData.cnpj.replace(/\D/g, '').length !== 14) return;
            setShowCnpjSpinner(true);
            setCnpjError('');
            try {
                const response = await fetch('/api/gemini/cnpj-lookup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cnpj: formData.cnpj }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                setFormData(prev => ({
                    ...prev,
                    company: data.company || prev.company,
                    name: data.name || prev.name,
                    email: data.email || prev.email,
                    phone: data.phone || prev.phone,
                    cnaes: (data.cnaes || []).join(', '),
                    businessDescription: data.businessDescription || prev.businessDescription,
                    username: data.username || prev.username,
                }));
            } catch (error: any) {
                setCnpjError(error.message);
            } finally {
                setShowCnpjSpinner(false);
            }
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };
        
        const handleMultiClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedIds = Array.from(e.target.selectedOptions, option => Number(option.value));
            setFormData(prev => ({...prev, selectedClientIds: selectedIds}));
        }

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold">{client ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">CNPJ</label>
                        <div className="flex items-center">
                            <input name="cnpj" value={formData.cnpj} onChange={handleChange} onBlur={handleCnpjLookup} className="w-full p-2 border rounded-l" />
                            <button type="button" onClick={handleCnpjLookup} className="bg-gray-200 p-2 border-t border-b border-r rounded-r">
                                {showCnpjSpinner ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div> : <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="w-5 h-5"/>}
                            </button>
                        </div>
                        {cnpjError && <p className="text-red-500 text-xs mt-1">{cnpjError}</p>}
                    </div>
                     <div><label className="block text-sm font-medium">Razão Social</label><input name="company" value={formData.company} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                     <div><label className="block text-sm font-medium">Nome Fantasia</label><input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                     <div><label className="block text-sm font-medium">Email Principal</label><input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                     <div><label className="block text-sm font-medium">Telefone</label><input name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                     <div><label className="block text-sm font-medium">Regime Tributário</label><select name="taxRegime" value={formData.taxRegime} onChange={handleChange} className="w-full p-2 border rounded"><option value="SimplesNacional">Simples Nacional</option><option value="LucroPresumido">Lucro Presumido</option><option value="LucroReal">Lucro Real</option></select></div>
                </div>

                <div>
                    <label className="block text-sm font-medium">CNAEs (separados por vírgula)</label>
                    <input name="cnaes" value={formData.cnaes} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Descrição do Negócio</label>
                    <textarea name="businessDescription" value={formData.businessDescription} onChange={handleChange} rows={3} className="w-full p-2 border rounded"></textarea>
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Acesso do Cliente</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="username" value={formData.username} onChange={handleChange} placeholder="Nome de usuário" className="w-full p-2 border rounded" required disabled={!!client}/>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={client ? "Nova Senha (deixe em branco para manter)" : "Senha"} className="w-full p-2 border rounded" required={!client}/>
                    </div>
                     {clientUser && (
                         <div className="mt-4">
                            <label className="block text-sm font-medium">Empresas Acessíveis</label>
                            <select multiple value={formData.selectedClientIds.map(String)} onChange={handleMultiClientChange} className="w-full p-2 border rounded h-24">
                                {clients.filter(c=>c.status==='Ativo').map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                            </select>
                             <p className="text-xs text-gray-500 mt-1">Segure Ctrl (ou Cmd) para selecionar múltiplos.</p>
                         </div>
                     )}
                </div>

                {!client && (
                    <div className="border-t pt-4">
                         <label className="block text-sm font-medium">Criar Tarefas Iniciais (Opcional)</label>
                         <select name="taskTemplateSetId" value={formData.taskTemplateSetId} onChange={handleChange} className="w-full p-2 border rounded">
                             <option value="">Nenhum modelo</option>
                             {taskTemplateSets.map(ts => <option key={ts.id} value={ts.id}>{ts.name}</option>)}
                         </select>
                    </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Salvar</button>
                </div>
            </form>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-black">Gestão de Clientes</h2>
                <div className="flex items-center space-x-4">
                    <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border rounded-lg" />
                    <button onClick={() => handleOpenModal(null)} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark transition-colors">
                        <Icon path="M12 6v6m0 0v6m0-6h6m-6 0H6" className="w-5 h-5 mr-2" />
                        Adicionar Cliente
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            <th className="px-5 py-3">Empresa / Contato</th>
                            <th className="px-5 py-3">CNPJ</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(client => (
                            <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-5 py-5 text-sm">
                                    <p className="font-semibold">{client.company}</p>
                                    <p className="text-gray-600">{client.name}</p>
                                </td>
                                <td className="px-5 py-5 text-sm">{client.cnpj}</td>
                                <td className="px-5 py-5 text-sm">
                                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${client.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{client.status}</span>
                                </td>
                                <td className="px-5 py-5 text-sm">
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => handleViewDashboard(client.id)} className="text-blue-600 hover:text-blue-900" title="Ver Painel do Cliente"><Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z" className="w-5 h-5" /><Icon path="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" className="w-5 h-5" /></button>
                                        <button onClick={() => handleOpenModal(client)} className="text-yellow-600 hover:text-yellow-900" title="Editar"><Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" className="w-5 h-5" /></button>
                                        {client.status === 'Ativo' && <button onClick={() => onInactivate(client.id)} className="text-gray-600 hover:text-gray-900" title="Inativar"><Icon path="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" className="w-5 h-5"/></button>}
                                        <button onClick={() => setClientToDelete(client)} className="text-red-600 hover:text-red-900" title="Excluir Permanentemente"><Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-5 h-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
                <ClientForm client={editingClient} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
             <Modal isOpen={!!clientToDelete} onClose={() => setClientToDelete(null)}>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão Permanente</h3>
                    <p>Você tem certeza que deseja excluir o cliente <strong>{clientToDelete?.company}</strong>? Esta ação é irreversível e excluirá todos os documentos, cobranças e tarefas associados.</p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setClientToDelete(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="button" onClick={() => { if(clientToDelete) onDelete(clientToDelete.id); setClientToDelete(null); }} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Excluir</button>
                    </div>
                </div>
             </Modal>
        </div>
    );
};

export default ClientView;
