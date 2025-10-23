import React, { useState, useEffect, useMemo } from 'react';
import { Client, Document, Invoice } from '../types.ts';
import { clients as mockClients, documents as mockDocuments, invoices as mockInvoices } from '../data/mockData.ts';


// --- Reusable Components ---
interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
}
const Modal: React.FC<ModalProps> = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white rounded-t-lg">
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <button onClick={onClose} aria-label="Fechar" className="text-gray-500 hover:text-gray-900 text-3xl font-light">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">{children}</div>
        </div>
    </div>
);

const DocumentStatusBadge: React.FC<{ status: Document['status'] }> = ({ status }) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusClasses = {
        Approved: "bg-green-100 text-green-800",
        Pending: "bg-yellow-100 text-yellow-800",
        Rejected: "bg-red-100 text-red-800",
    };
    const statusText = {
        Approved: "Aprovado",
        Pending: "Pendente",
        Rejected: "Rejeitado",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{statusText[status]}</span>;
}

const InvoiceStatusBadge: React.FC<{ status: Invoice['status'] }> = ({ status }) => {
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

interface ClientHistoryModalProps {
    client: Client;
    onClose: () => void;
    allDocuments: Document[];
    allInvoices: Invoice[];
}

const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({ 
    client, 
    onClose,
    allDocuments,
    allInvoices,
}) => {

    const clientDocuments = useMemo(() => 
        allDocuments.filter(doc => doc.clientName === client.companyName), 
        [allDocuments, client.companyName]
    );

    const clientInvoices = useMemo(() => 
        allInvoices.filter(inv => inv.clientName === client.companyName),
        [allInvoices, client.companyName]
    );

    return (
        <Modal title={`Histórico do Cliente: ${client.companyName}`} onClose={onClose}>
            <div className="space-y-6">
                {/* Documents Section */}
                <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Histórico de Documentos</h4>
                    <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enviado por</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {clientDocuments.length > 0 ? clientDocuments.map(doc => (
                                        <tr key={`doc-${doc.id}`}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.uploadedBy}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{doc.uploadDate}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm"><DocumentStatusBadge status={doc.status} /></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-5 text-sm text-gray-500">Nenhum documento encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Invoices Section */}
                <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Histórico de Pagamentos</h4>
                     <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {clientInvoices.length > 0 ? clientInvoices.map(inv => (
                                        <tr key={`inv-${inv.id}`}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{inv.description}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">R$ {inv.amount.toFixed(2)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{inv.dueDate}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm"><InvoiceStatusBadge status={inv.status} /></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-5 text-sm text-gray-500">Nenhuma cobrança encontrada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
             <div className="pt-5 flex justify-end">
                <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                    Fechar
                </button>
            </div>
        </Modal>
    );
};

interface FormInputProps {
    label: string;
    id: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    placeholder?: string;
    maxLength?: number;
    disabled?: boolean;
}

const FormInput: React.FC<FormInputProps> = 
({label, id, type = 'text', value, onChange, required = true, placeholder, maxLength, disabled = false}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            type={type} 
            id={id} 
            name={id} 
            value={value} 
            onChange={onChange} 
            required={required}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100" 
        />
    </div>
);

const ClientRegistrationPage: React.FC = () => {
    // --- Page State ---
    const [clients, setClients] = useState<Client[]>(mockClients);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [observingClient, setObservingClient] = useState<Client | null>(null);

    // --- Form State ---
    const [companyName, setCompanyName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [cnae, setCnae] = useState('');
    const [taxRegime, setTaxRegime] = useState('Simples Nacional');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [certificateType, setCertificateType] = useState('A1');
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [certificatePassword, setCertificatePassword] = useState('');
    const [certificateExpiration, setCertificateExpiration] = useState<string | null>(null);
    const [isDetectingA3, setIsDetectingA3] = useState(false);

    const filteredClients = useMemo(() => {
        if (!searchTerm) {
            return clients;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return clients.filter(client =>
            client.companyName.toLowerCase().includes(lowercasedFilter) ||
            client.cnpj.includes(searchTerm)
        );
    }, [clients, searchTerm]);

    // --- Form and Modal Logic ---
    const resetForm = () => {
        setCompanyName(''); setCnpj(''); setCnae('');
        setTaxRegime('Simples Nacional'); setEmail(''); setPhone('');
        setLogin(''); setPassword(''); setConfirmPassword('');
        setPasswordError(''); setCertificateType('A1'); setCertificateFile(null);
        setCertificatePassword(''); setCertificateExpiration(null);
    };
    
    useEffect(() => {
        if (isModalOpen) {
            if (editingClient) {
                setCompanyName(editingClient.companyName);
                setCnpj(editingClient.cnpj);
                setEmail(editingClient.email);
                setPhone(editingClient.phone);
                setTaxRegime(editingClient.taxRegime);
                setCertificateExpiration(editingClient.certificateExpiration);
                // Resetting sensitive/action-based fields
                setCnae(''); setLogin(''); setPassword(''); setConfirmPassword('');
                setCertificateType('A1'); setCertificateFile(null); setCertificatePassword('');
            } else {
                resetForm();
            }
        }
    }, [isModalOpen, editingClient]);

    const handleOpenModal = (client: Client | null) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleOpenObserveModal = (client: Client) => {
        setObservingClient(client);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        if (!editingClient && password !== confirmPassword) {
            setPasswordError('As senhas não coincidem.');
            return;
        }

        const clientData = {
            companyName, cnpj, email, phone,
            taxRegime: taxRegime,
            certificateExpiration,
        };

        if (editingClient) {
            setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...clientData } : c));
            alert(`Cliente "${companyName}" atualizado com sucesso!`);
        } else {
            const newClient: Client = {
                ...clientData,
                id: String(Date.now()),
                isActive: true,
            };
            setClients(prevClients => [newClient, ...prevClients]);
            alert(`Cliente "${companyName}" cadastrado com sucesso!`);
        }
        handleCloseModal();
    };

    const handleDeleteClient = (clientId: string | number) => {
        if (window.confirm('Tem certeza de que deseja excluir este cliente? Esta ação é irreversível.')) {
            setClients(prev => prev.filter(c => c.id !== clientId));
        }
    };
    
    const handleToggleStatus = (clientId: string | number) => {
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, isActive: !c.isActive } : c));
    };


    // --- Formatter Handlers ---
    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .slice(0, 18);
        setCnpj(value);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15);
        setPhone(value);
    };

    const handleCertificateTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCertificateType(e.target.value);
        setCertificateFile(null);
        setCertificatePassword('');
        setCertificateExpiration(null);
    };

    const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCertificateFile(file);
            const expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
            setCertificateExpiration(expirationDate.toLocaleDateString('pt-BR'));
        }
    };

    const handleDetectA3 = () => {
        setIsDetectingA3(true);
        setCertificateExpiration(null);
        setTimeout(() => {
            const expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 3);
            setCertificateExpiration(expirationDate.toLocaleDateString('pt-BR'));
            setIsDetectingA3(false);
            alert('Certificado A3 detectado com sucesso!');
        }, 2500);
    };
    
    const renderRegistrationForm = () => (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Data Section */}
            <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Dados da Empresa</h3>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                        <FormInput label="Nome da Empresa" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                        <div className="sm:col-span-3">
                        <FormInput label="CNPJ" id="cnpj" value={cnpj} onChange={handleCnpjChange} placeholder="00.000.000/0000-00" maxLength={18}/>
                    </div>
                    <div className="sm:col-span-3">
                        <FormInput label="CNAE Principal" id="cnae" value={cnae} onChange={(e) => setCnae(e.target.value)} placeholder="Ex: 6201-5/01"/>
                    </div>
                    <div className="sm:col-span-6">
                        <label htmlFor="taxRegime" className="block text-sm font-medium text-gray-700">Regime Tributário</label>
                        <select id="taxRegime" name="taxRegime" value={taxRegime} onChange={(e) => setTaxRegime(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md">
                            <option>Simples Nacional</option>
                            <option>Lucro Presumido</option>
                            <option>Lucro Real</option>
                        </select>
                    </div>
                        <div className="sm:col-span-3">
                        <FormInput label="Email" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="sm:col-span-3">
                        <FormInput label="Telefone" id="phone" value={phone} onChange={handlePhoneChange} placeholder="(00) 00000-0000" maxLength={15} />
                    </div>
                </div>
            </div>
            
            {/* Digital Certificate Section */}
            <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Certificado Digital</h3>
                <div className="mt-4">
                    <fieldset>
                        <legend className="text-sm font-medium text-gray-700">Tipo de Certificado</legend>
                        <div className="mt-2 flex items-center space-x-6">
                            <div className="flex items-center">
                                <input id="cert-a1" name="certificate-type" type="radio" value="A1" checked={certificateType === 'A1'} onChange={handleCertificateTypeChange} className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-gray-300"/>
                                <label htmlFor="cert-a1" className="ml-3 block text-sm font-medium text-gray-700">A1 (Arquivo)</label>
                            </div>
                            <div className="flex items-center">
                                <input id="cert-a3" name="certificate-type" type="radio" value="A3" checked={certificateType === 'A3'} onChange={handleCertificateTypeChange} className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-gray-300"/>
                                <label htmlFor="cert-a3" className="ml-3 block text-sm font-medium text-gray-700">A3 (Token/Cartão)</label>
                            </div>
                        </div>
                    </fieldset>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {certificateType === 'A1' && (
                        <>
                            <div className="sm:col-span-3">
                                <label htmlFor="certificateFile" className="block text-sm font-medium text-gray-700">Arquivo do Certificado (.pfx, .p12)</label>
                                <input type="file" id="certificateFile" name="certificateFile" accept=".pfx,.p12" onChange={handleCertificateFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-opacity-90"/>
                            </div>
                            <div className="sm:col-span-3">
                                <FormInput label="Senha do Certificado" id="certificatePassword" type="password" value={certificatePassword} onChange={(e) => setCertificatePassword(e.target.value)} />
                            </div>
                        </>
                    )}
                    {certificateType === 'A3' && (
                        <div className="sm:col-span-6">
                            <p className="text-sm text-gray-600 mb-2">Conecte seu dispositivo (token ou leitor de cartão) e clique no botão abaixo para que o sistema o reconheça.</p>
                            <button type="button" onClick={handleDetectA3} disabled={isDetectingA3} className="w-full px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 disabled:bg-gray-400 flex items-center justify-center">
                                {isDetectingA3 && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {isDetectingA3 ? 'Detectando...' : 'Detectar Certificado A3'}
                            </button>
                        </div>
                    )}
                    {certificateExpiration && (
                        <div className="sm:col-span-6">
                            <FormInput label="Vencimento do Certificado" id="certExpiration" value={certificateExpiration} onChange={() => {}} disabled={true} />
                        </div>
                    )}
                </div>
            </div>

            {/* Login Data Section (only for new clients) */}
            {!editingClient && (
                <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Credenciais de Acesso ao Portal</h3>
                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                            <FormInput label="Login (Usuário)" id="login" value={login} onChange={(e) => setLogin(e.target.value)} />
                        </div>
                        <div className="sm:col-span-3">
                            <FormInput label="Senha" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="sm:col-span-3">
                            <FormInput label="Confirmar Senha" id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        {passwordError && <p className="sm:col-span-6 text-sm text-red-600">{passwordError}</p>}
                        </div>
                </div>
            )}


            {/* Form Actions */}
            <div className="pt-8 flex justify-end">
                <button type="button" onClick={handleCloseModal} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                    Cancelar
                </button>
                <button type="submit" className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                    {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Clientes Cadastrados</h2>
                <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm font-medium">
                    Cadastrar Novo Cliente
                </button>
            </div>
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Pesquisar por nome da empresa ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-lg px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Empresa</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venc. Certificado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className={!client.isActive ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.companyName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.cnpj}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {client.isActive ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.certificateExpiration || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenObserveModal(client)} className="text-blue-600 hover:text-blue-800">Observar</button>
                                        <button onClick={() => handleOpenModal(client)} className="text-brand-primary hover:text-opacity-80">Editar</button>
                                        <button onClick={() => handleToggleStatus(client.id)} className="text-gray-600 hover:text-gray-900">{client.isActive ? 'Inativar' : 'Ativar'}</button>
                                        <button onClick={() => handleDeleteClient(client.id)} className="text-red-600 hover:text-red-800">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredClients.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>Nenhum cliente encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
            {observingClient && (
                <ClientHistoryModal 
                    client={observingClient}
                    onClose={() => setObservingClient(null)}
                    allDocuments={mockDocuments}
                    allInvoices={mockInvoices}
                />
            )}
            {isModalOpen && (
                <Modal title={editingClient ? "Editar Cliente" : "Cadastro de Novo Cliente"} onClose={handleCloseModal}>
                    {renderRegistrationForm()}
                </Modal>
            )}
        </div>
    );
};

export default ClientRegistrationPage;