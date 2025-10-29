import React, { useState } from 'react';
import { TaxGuide, User, Client, AppNotification, TaxGuideStatus } from '../types';
import Icon from './Icon';
import Modal from './Modal';
import * as api from '../services/api';

interface TaxGuideViewProps {
  taxGuides: TaxGuide[];
  setTaxGuides: React.Dispatch<React.SetStateAction<TaxGuide[]>>;
  currentUser: User;
  clients: Client[];
  users: User[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
  activeClientId: number | null;
  setIsLoading: (isLoading: boolean) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
};

const downloadFileFromBase64 = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const TaxGuideView: React.FC<TaxGuideViewProps> = ({ taxGuides, setTaxGuides, currentUser, clients, users, addNotification, activeClientId, setIsLoading }) => {
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState<TaxGuide | null>(null);
    const [guideToDelete, setGuideToDelete] = useState<TaxGuide | null>(null);
    const [selectedClientFilter, setSelectedClientFilter] = useState<number | 'all'>(activeClientId || 'all');
    
    const canManage = currentUser.role === 'AdminGeral' || !!currentUser.permissions?.canManageDocuments;
    const isClient = currentUser.role === 'Cliente';

    const handleUploadGuide = async (data: any) => {
        setIsLoading(true);
        try {
            const newGuide = await api.createTaxGuide(data);
            setTaxGuides(prev => [newGuide, ...prev]);
            const clientUser = users.find(u => u.clientIds.includes(newGuide.clientId));
            if (clientUser) {
                addNotification({ userId: clientUser.id, message: `Uma nova guia de imposto foi disponibilizada: ${newGuide.name}` });
            }
        } catch (error) {
            console.error("Failed to upload tax guide", error);
            alert("Erro ao enviar guia.");
        } finally {
            setIsLoading(false);
            setUploadModalOpen(false);
        }
    };

    const handleMarkAsPaid = async (guide: TaxGuide, receiptFile: File | null) => {
        setIsLoading(true);
        try {
            let receiptBase64: string | null = null;
            if (receiptFile) {
                receiptBase64 = await fileToBase64(receiptFile);
            }
            const updatedGuide = await api.markGuideAsPaid(guide.id, receiptBase64);
            setTaxGuides(prev => prev.map(g => g.id === guide.id ? updatedGuide : g));
             users.filter(u => u.role.includes('Admin')).forEach(admin => {
                addNotification({ userId: admin.id, message: `${currentUser.name} marcou a guia "${guide.name}" como paga.` });
            });
        } catch (error) {
            console.error("Failed to mark guide as paid", error);
        } finally {
            setIsLoading(false);
            setPaymentModalOpen(null);
        }
    };

    const handleDeleteGuide = async () => {
        if (!guideToDelete) return;
        setIsLoading(true);
        try {
            await api.deleteTaxGuide(guideToDelete.id);
            setTaxGuides(prev => prev.filter(g => g.id !== guideToDelete.id));
        } catch (error) {
            console.error("Failed to delete guide", error);
        } finally {
            setIsLoading(false);
            setGuideToDelete(null);
        }
    };

    const getStatusClass = (status: TaxGuideStatus) => {
        const classes: Record<TaxGuideStatus, string> = {
            'Pendente': 'bg-yellow-100 text-yellow-800',
            'Pago': 'bg-green-100 text-green-800',
            'Atrasado': 'bg-red-100 text-red-800',
        };
        return classes[status];
    };
    
    const guidesForView = useMemo(() => {
        let filtered = taxGuides;
        if (isClient) {
            filtered = taxGuides.filter(g => g.clientId === activeClientId);
        } else if (selectedClientFilter !== 'all') {
            filtered = taxGuides.filter(g => g.clientId === selectedClientFilter);
        }
        return filtered.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }, [taxGuides, isClient, activeClientId, selectedClientFilter]);

    // Modals and Forms
    const UploadGuideModal: React.FC = () => {
        const [formData, setFormData] = useState({
            clientId: clients[0]?.id || '',
            name: 'DAS - Simples Nacional',
            referenceMonth: new Date().getMonth() + 1,
            referenceYear: new Date().getFullYear(),
            dueDate: '',
            amount: '',
            file: null as File | null,
        });

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        };
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }));
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!formData.file) {
                alert("Por favor, anexe o arquivo da guia.");
                return;
            }
            const fileContent = await fileToBase64(formData.file);
            handleUploadGuide({
                ...formData,
                fileName: formData.file.name,
                fileContent,
            });
        };

        return (
            <Modal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-xl font-bold text-black">Enviar Guia de Imposto</h3>
                    <select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full p-2 border rounded" required>
                        {clients.filter(c => c.status === 'Ativo').map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                    </select>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome da Guia (ex: DAS)" className="w-full p-2 border rounded" required/>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="referenceMonth" type="number" value={formData.referenceMonth} onChange={handleChange} placeholder="Mês (1-12)" className="w-full p-2 border rounded" required/>
                        <input name="referenceYear" type="number" value={formData.referenceYear} onChange={handleChange} placeholder="Ano" className="w-full p-2 border rounded" required/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} className="w-full p-2 border rounded" required/>
                        <input name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="Valor (R$)" className="w-full p-2 border rounded" required/>
                    </div>
                    <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-dark/10 file:text-primary hover:file:bg-primary-dark/20" accept="application/pdf" required/>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setUploadModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Enviar Guia</button>
                    </div>
                </form>
            </Modal>
        );
    };
    
    const PaymentModal: React.FC<{ guide: TaxGuide | null }> = ({ guide }) => {
        const [receipt, setReceipt] = useState<File | null>(null);
        if (!guide) return null;

        return (
            <Modal isOpen={!!guide} onClose={() => setPaymentModalOpen(null)}>
                <div>
                    <h3 className="text-xl font-bold text-black">Confirmar Pagamento</h3>
                    <p className="my-2">Você está marcando a guia <strong>{guide.name}</strong> (Venc: {new Date(guide.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}) como paga.</p>
                    <p className="text-sm text-gray-600 mb-4">Se desejar, anexe o comprovante de pagamento (opcional).</p>
                    <input type="file" onChange={e => setReceipt(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-dark/10 file:text-primary hover:file:bg-primary-dark/20" />
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setPaymentModalOpen(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="button" onClick={() => handleMarkAsPaid(guide, receipt)} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Confirmar Pagamento</button>
                    </div>
                </div>
            </Modal>
        )
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-black">Guias de Impostos</h2>
                {canManage && (
                    <div className="flex items-center space-x-4">
                        <select value={selectedClientFilter} onChange={e => setSelectedClientFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="p-2 border rounded">
                            <option value="all">Todos os Clientes</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                        </select>
                        <button onClick={() => setUploadModalOpen(true)} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark transition-colors">
                            <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" className="w-5 h-5 mr-2" />
                            Enviar Guia
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {!isClient && <th className="px-5 py-3">Cliente</th>}
                            <th className="px-5 py-3">Guia</th>
                            <th className="px-5 py-3">Competência</th>
                            <th className="px-5 py-3">Vencimento</th>
                            <th className="px-5 py-3">Valor</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guidesForView.map(guide => {
                            const client = clients.find(c => c.id === guide.clientId);
                            return (
                                <tr key={guide.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    {!isClient && <td className="px-5 py-5 text-sm">{client?.company}</td>}
                                    <td className="px-5 py-5 text-sm font-semibold text-gray-800">{guide.name}</td>
                                    <td className="px-5 py-5 text-sm">{`${String(guide.referenceMonth).padStart(2, '0')}/${guide.referenceYear}`}</td>
                                    <td className="px-5 py-5 text-sm">{new Date(guide.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                    <td className="px-5 py-5 text-sm">R$ {guide.amount.toFixed(2)}</td>
                                    <td className="px-5 py-5 text-sm"><span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getStatusClass(guide.status)}`}>{guide.status}</span></td>
                                    <td className="px-5 py-5 text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => downloadFileFromBase64(guide.fileContent, guide.fileName)} className="text-blue-600 hover:text-blue-900" title="Baixar Guia">
                                                <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" className="w-5 h-5" />
                                            </button>
                                            {isClient && guide.status === 'Pendente' && (
                                                <button onClick={() => setPaymentModalOpen(guide)} className="text-green-600 hover:text-green-900" title="Marcar como Paga">
                                                    <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5" />
                                                </button>
                                            )}
                                            {canManage && (
                                                <button onClick={() => setGuideToDelete(guide)} className="text-red-600 hover:text-red-900" title="Excluir">
                                                    <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            
            <UploadGuideModal />
            <PaymentModal guide={isPaymentModalOpen} />
            
            <Modal isOpen={!!guideToDelete} onClose={() => setGuideToDelete(null)}>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Confirmar Exclusão</h3>
                    <p>Tem certeza que deseja excluir a guia <strong>{guideToDelete?.name}</strong>? Esta ação é irreversível.</p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={() => setGuideToDelete(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="button" onClick={handleDeleteGuide} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Excluir</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TaxGuideView;
