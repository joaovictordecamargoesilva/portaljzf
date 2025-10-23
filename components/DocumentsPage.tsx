import React, { useState, useMemo } from 'react';
import { UserRole, User, Document as Doc } from '../types.ts';

// --- Data Structure for Document Selection ---

const documentCategories = [
  {
    name: 'Recursos Humanos (RH / Departamento Pessoal)',
    type: 'RH',
    subCategories: [
      {
        name: 'Documentos de Admissão',
        documents: [
          { name: 'Ficha de Registro de Empregado (FRE)' },
          { name: 'Contrato de Trabalho (CLT, experiência, intermitente, estágio etc.)' },
          { name: 'Carteira de Trabalho (física ou digital)' },
          { name: 'Documentos pessoais (RG, CPF, CNH, título de eleitor, reservista, PIS, certidão)' },
          { name: 'Comprovante de residência' },
          { name: 'Atestado de saúde ocupacional (ASO admissional)' },
          { name: 'Declaração de dependentes (IR e salário-família)' },
          { name: 'Termo de responsabilidade por equipamentos e uniformes' },
        ],
      },
      {
        name: 'Documentos de Folha e Pagamento',
        documents: [
          { name: 'Folha de pagamento mensal' },
          { name: 'Recibos de pagamento de salário e pró-labore' },
          { name: 'Recibo de férias e 13º salário' },
          { name: 'Controle de ponto / banco de horas' },
          { name: 'Planilha de benefícios (vale-transporte, alimentação, plano de saúde)' },
          { name: 'Informe de rendimentos anuais' },
          { name: 'RAIS / eSocial / DIRF' },
        ],
      },
      {
        name: 'Documentos de Saúde e Segurança do Trabalho',
        documents: [
          { name: 'PPRA / PGR (Programa de Prevenção de Riscos Ambientais / Gerenciamento de Riscos)' },
          { name: 'PCMSO (Programa de Controle Médico de Saúde Ocupacional)' },
          { name: 'LTCAT (Laudo Técnico de Condições Ambientais do Trabalho)' },
          { name: 'Atestados de saúde ocupacional (admissional, periódico, demissional)' },
          { name: 'CAT (Comunicação de Acidente de Trabalho)' },
        ],
      },
      {
        name: 'Documentos de Rescisão',
        documents: [
          { name: 'Termo de Rescisão de Contrato de Trabalho (TRCT)' },
          { name: 'Termo de Quitação / Homologação' },
          { name: 'Guias de FGTS e GRRF' },
          { name: 'Extrato do FGTS' },
          { name: 'Comprovante de envio ao eSocial' },
          { name: 'Comunicação de dispensa / seguro-desemprego' },
        ],
      },
    ],
  },
  {
    name: 'Contábil',
    type: 'Contábil',
    subCategories: [
      {
        name: 'Documentos Contábeis Obrigatórios',
        documents: [
          { name: 'Livro Diário' },
          { name: 'Livro Razão' },
          { name: 'Balancete de verificação' },
          { name: 'Balanço Patrimonial' },
          { name: 'DRE (Demonstração do Resultado do Exercício)' },
          { name: 'DMPL / DLPA (Demonstração das Mutações / Lucros ou Prejuízos Acumulados)' },
          { name: 'DFC (Demonstração de Fluxo de Caixa)' },
          { name: 'Notas explicativas' },
        ],
      },
      {
        name: 'Documentos de Suporte à Contabilidade',
        documents: [
          { name: 'Extratos bancários e comprovantes' },
          { name: 'Notas fiscais de compra, venda e serviços' },
          { name: 'Comprovantes de pagamentos e recebimentos' },
          { name: 'Contratos e escrituras' },
          { name: 'Documentos de depreciação / ativos fixos' },
          { name: 'Folhas de pagamento e pró-labore' },
          { name: 'Comprovantes de tributos pagos' },
        ],
      },
      {
        name: 'Declarações e Obrigações Acessórias',
        documents: [
          { name: 'ECD (Escrituração Contábil Digital)' },
          { name: 'ECF (Escrituração Contábil Fiscal)' },
          { name: 'DCTF (Declaração de Débitos e Créditos Tributários Federais)' },
          { name: 'DEFIS (para empresas do Simples Nacional)' },
          { name: 'DIRF' },
        ],
      },
    ],
  },
  {
    name: 'Fiscal / Tributária',
    type: 'Fiscal',
    subCategories: [
      {
        name: 'Documentos de Entrada e Saída',
        documents: [
          { name: 'Notas fiscais de entrada (compras, serviços tomados)' },
          { name: 'Notas fiscais de saída (vendas, serviços prestados)' },
          { name: 'Cupons fiscais e recibos' },
          { name: 'Documentos de transporte (CT-e, MDF-e)' },
        ],
      },
      {
        name: 'Obrigações Acessórias e Declarações',
        documents: [
          { name: 'SPED Fiscal (ICMS/IPI)' },
          { name: 'SPED Contribuições (PIS/COFINS)' },
          { name: 'EFD-Reinf' },
          { name: 'eSocial (parte tributária)' },
          { name: 'GIA (Guia de Informação e Apuração do ICMS – estadual)' },
          { name: 'DIME / DIEF (dependendo do estado)' },
          { name: 'Declaração de Serviços (ISSQN – municipal)' },
          { name: 'PGDAS-D (Simples Nacional)' },
          { name: 'DCTF / PERDCOMP / DACON (antigas)' },
        ],
      },
      {
        name: 'Tributos e Guias',
        documents: [
          { name: 'DARF (Impostos Federais: IRPJ, CSLL, PIS, COFINS, IRRF, etc.)' },
          { name: 'DAS (Simples Nacional)' },
          { name: 'GPS / INSS' },
          { name: 'FGTS / GRF' },
          { name: 'ICMS / IPI / ISS' },
          { name: 'Recolhimento de Taxas Municipais / Alvarás' },
        ],
      },
    ],
  },
  {
    name: 'Societária (Legalização e Governança)',
    type: 'Societário',
    subCategories: [
      {
        name: 'Constituição e Alterações da Empresa',
        documents: [
          { name: 'Contrato Social ou Requerimento de Empresário' },
          { name: 'DBE (Documento Básico de Entrada – Receita Federal)' },
          { name: 'Ficha de Cadastro Nacional (CNPJ)' },
          { name: 'Inscrição Estadual e Municipal' },
          { name: 'Alvará de Funcionamento e Sanitário' },
          { name: 'Certidões Negativas (Federal, Estadual, Municipal, Trabalhista)' },
        ],
      },
      {
        name: 'Alterações Contratuais',
        documents: [
          { name: 'Alteração Contratual (mudança de sócios, endereço, capital, objeto etc.)' },
          { name: 'Requerimento de empresário (MEI → LTDA, etc.)' },
          { name: 'Ata de Reunião ou Assembleia (para Ltda. e S/A)' },
          { name: 'Registro na Junta Comercial ou Cartório' },
        ],
      },
      {
        name: 'Encerramento e Regularização',
        documents: [
          { name: 'Distrato Social' },
          { name: 'Certidões de baixa' },
          { name: 'Declaração de encerramento de inscrição estadual / municipal' },
          { name: 'Comunicação à Receita Federal' },
        ],
      },
      {
        name: 'Governança e Documentos de Controle',
        documents: [
          { name: 'Livro de atas (quotistas ou acionistas)' },
          { name: 'Livro de presença e deliberação' },
          { name: 'Procurações, atas e mandatos' },
          { name: 'Contratos de prestação de serviços contábeis e jurídicos' },
          { name: 'Termos de responsabilidade e guarda de documentos' },
        ],
      },
    ],
  },
];

const StatusBadge: React.FC<{ status: Doc['status'] }> = ({ status }) => {
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

const Modal: React.FC<{ children: React.ReactNode, onClose: () => void, title: string, large?: boolean }> = ({ children, onClose, title, large = false }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className={`bg-white rounded-lg shadow-xl w-full ${large ? 'max-w-4xl' : 'max-w-md'}`}>
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold text-black">{title}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

// --- Initial Form States ---
const initialAdmissionData = {
    fullName: '', cpf: '', dob: '', race: '', maritalStatus: '', fatherName: '', motherName: '', birthPlace: '',
    address: '', hasChildren: 'não', rg: '', ctps: '', isCtpsDigital: false, pis: '', voterId: '', admissionDate: '',
    isTrial: 'sim', jobTitle: '', salary: '', hasAdvance: 'sim', workSchedule: '', asoFile: null as File | null,
};

const initialDismissalData = {
    employeeName: '', lastDayWorked: '', noticeType: 'indenizado', reason: '', asoFile: null as File | null,
};

const initialDependent = { name: '', cpf: '', dob: '', relationship: '' };
const initialDependentsData = [initialDependent];

const initialContractChangeData = {
    changeType: '', newAddress: '', newCapital: '', newPartners: '', newActivities: '',
};

const initialAssetData = {
    description: '', purchaseDate: '', value: '', invoiceNumber: '', invoiceFile: null as File | null,
};

// --- List of Document Names that use forms ---
const formDocuments = [
    'Ficha de Registro de Empregado (FRE)',
    'Comunicação de dispensa / seguro-desemprego',
    'Declaração de dependentes (IR e salário-família)',
    'Alteração Contratual (mudança de sócios, endereço, capital, objeto etc.)',
    'Documentos de depreciação / ativos fixos',
];

// --- Map of File Type Restrictions ---
const fileTypeRestrictions: { [key: string]: string } = {
  'Notas fiscais de entrada (compras, serviços tomados)': '.xml',
  'Notas fiscais de saída (vendas, serviços prestados)': '.xml',
  'Extratos bancários e comprovantes': '.ofx',
};

interface DocumentsPageProps {
    user: User;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ user }) => {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('client');
  const [openClients, setOpenClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // State for chained selects
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // State for Forms
  const [admissionData, setAdmissionData] = useState(initialAdmissionData);
  const [dismissalData, setDismissalData] = useState(initialDismissalData);
  const [dependentsData, setDependentsData] = useState(initialDependentsData);
  const [contractChangeData, setContractChangeData] = useState(initialContractChangeData);
  const [assetData, setAssetData] = useState(initialAssetData);

  const toggleClient = (clientName: string) => {
    setOpenClients(prevOpenClients =>
      prevOpenClients.includes(clientName)
        ? prevOpenClients.filter(cn => cn !== clientName)
        : [...prevOpenClients, clientName]
    );
  };

  const documentsForUser = useMemo(() => 
    user.role === UserRole.ADMIN 
      ? documents 
      : documents.filter(doc => doc.clientName === user.companyName),
    [documents, user]
  );

  const clientOriginatedDocs = useMemo(() =>
    documentsForUser.filter(doc => doc.uploadedBy === 'Cliente'),
    [documentsForUser]
  );

  const officeOriginatedDocs = useMemo(() =>
      documentsForUser.filter(doc => doc.uploadedBy === 'Admin JZF'),
      [documentsForUser]
  );

  const documentsToDisplay = activeTab === 'client' ? clientOriginatedDocs : officeOriginatedDocs;

  const filteredDocs = useMemo(() => {
    if (user.role !== UserRole.ADMIN || !searchTerm) {
        return documentsToDisplay;
    }
    return documentsToDisplay.filter(doc =>
        doc.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documentsToDisplay, searchTerm, user.role]);

  const groupedDocs = useMemo(() => {
    if (user.role !== UserRole.ADMIN) return {};
    return filteredDocs.reduce((acc, doc) => {
        const key = doc.clientName || 'Sem cliente';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(doc);
        return acc;
    }, {} as { [key: string]: Doc[] });
  }, [filteredDocs, user.role]);


  const resetSelections = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedDocument('');
    setSelectedFile(null);
    setAdmissionData(initialAdmissionData);
    setDismissalData(initialDismissalData);
    setDependentsData(initialDependentsData);
    setContractChangeData(initialContractChangeData);
    setAssetData(initialAssetData);
  };
  
  // --- Input Handlers for Forms ---
  const createInputHandler = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        const { checked } = e.target;
        setter((prev) => ({ ...prev, [name]: checked }));
    } else {
        setter((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const createFileInputHandler = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, fieldName: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setter((prev) => ({ ...prev, [fieldName]: e.target.files![0] }));
      }
  };

  const handleAdmissionInputChange = createInputHandler(setAdmissionData);
  const handleAdmissionFileChange = createFileInputHandler(setAdmissionData, 'asoFile');
  const handleDismissalInputChange = createInputHandler(setDismissalData);
  const handleDismissalFileChange = createFileInputHandler(setDismissalData, 'asoFile');
  const handleContractChangeInputChange = createInputHandler(setContractChangeData);
  const handleAssetInputChange = createInputHandler(setAssetData);
  const handleAssetFileChange = createFileInputHandler(setAssetData, 'invoiceFile');

  const handleDependentChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newDependents = [...dependentsData];
    newDependents[index] = { ...newDependents[index], [name]: value };
    setDependentsData(newDependents);
  };
  
  const addDependent = () => setDependentsData([...dependentsData, initialDependent]);
  const removeDependent = (index: number) => setDependentsData(dependentsData.filter((_, i) => i !== index));

  // --- Generic Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const restriction = fileTypeRestrictions[selectedDocument];

        if (restriction) {
            const allowedExtensions = restriction.split(',').map(ext => ext.trim().toLowerCase());
            const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
            
            if (!allowedExtensions.includes(fileExtension)) {
                alert(`Tipo de arquivo inválido. Para este documento, apenas arquivos do tipo ${restriction} são permitidos.`);
                e.target.value = ''; // Clear the input
                setSelectedFile(null);
                return;
            }
        }
        setSelectedFile(file);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory('');
    setSelectedDocument('');
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubCategory(e.target.value);
    setSelectedDocument('');
  };
  
  const getDocumentNameForSubmission = () => {
    switch (selectedDocument) {
        case 'Ficha de Registro de Empregado (FRE)':
            return `Admissão - ${admissionData.fullName}`;
        case 'Comunicação de dispensa / seguro-desemprego':
            return `Demissão - ${dismissalData.employeeName}`;
        case 'Declaração de dependentes (IR e salário-família)':
            return `Declaração de Dependentes (${dependentsData.length})`;
        case 'Alteração Contratual (mudança de sócios, endereço, capital, objeto etc.)':
            return `Alteração Contratual - ${contractChangeData.changeType}`;
        case 'Documentos de depreciação / ativos fixos':
            return `Novo Ativo - ${assetData.description}`;
        default:
            return selectedFile?.name || 'Documento Enviado';
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const category = documentCategories.find(c => c.name === selectedCategory);
    if (!category || !selectedDocument) return;

    let isFormValid = true;
    if (formDocuments.includes(selectedDocument)) {
        // Basic validation for form-based docs
        if(selectedDocument === 'Ficha de Registro de Empregado (FRE)' && !admissionData.fullName) isFormValid = false;
        if(selectedDocument === 'Comunicação de dispensa / seguro-desemprego' && !dismissalData.employeeName) isFormValid = false;
    } else {
        if (!selectedFile) isFormValid = false;
    }

    if (!isFormValid) {
        alert('Por favor, preencha as informações necessárias.');
        return;
    }

    const newDoc: Doc = {
        id: (documents.length + 1).toString(),
        name: getDocumentNameForSubmission(),
        type: category.type,
        uploadedBy: 'Cliente',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        clientName: user.companyName!,
    };
    
    setDocuments([newDoc, ...documents]);
    alert(`Documento "${newDoc.name}" enviado com sucesso!`);
    resetSelections();
    setUploadModalOpen(false);
  };
  
  const handleRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!selectedDocument) return;
    
    const category = documentCategories.find(c => c.name === selectedCategory);
    if (!category) return;

    const newRequestDoc: Doc = {
        id: (documents.length + 1).toString(),
        name: `Solicitação: ${selectedDocument}`,
        type: category.type,
        uploadedBy: 'Cliente',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        clientName: user.companyName!,
    };

    setDocuments([newRequestDoc, ...documents]);

    alert(`Sua solicitação para "${selectedDocument}" foi enviada com sucesso!`);
    resetSelections();
    setRequestModalOpen(false);
  };
  
  // Fix: Changed docId type to string | number to match the Document interface.
  const handleApproveDocument = (docId: string | number) => {
    setDocuments(prevDocs => prevDocs.map(doc => 
      doc.id === docId ? { ...doc, status: 'Approved' } : doc
    ));
  };

  const currentCategory = documentCategories.find(c => c.name === selectedCategory);
  const subCategoryOptions = currentCategory ? currentCategory.subCategories : [];
  const currentSubCategory = subCategoryOptions.find(sc => sc.name === selectedSubCategory);
  const documentOptions = currentSubCategory ? currentSubCategory.documents : [];
  const isFormSelected = formDocuments.includes(selectedDocument);
  
  // --- Reusable Form Components ---
  const FormInput: React.FC<{label: string, name: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean, disabled?: boolean}> = 
    ({label, name, value, onChange, type = "text", required = true, disabled = false}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} disabled={disabled} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100" />
    </div>
  );

  const FormSelect: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, required?: boolean}> = 
    ({label, name, value, onChange, children, required = true}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
            {children}
        </select>
    </div>
  );

  const FileUploadInput: React.FC<{label: string, id: string, file: File | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, accept?: string}> = 
    ({label, id, file, onChange, accept = '*' }) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <label className="w-full flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4 4-4-4h3V9h2v2z" /></svg>
                <span className="truncate">{file ? file.name : `Selecionar arquivo`}</span>
                <input id={id} type="file" className="hidden" onChange={onChange} accept={accept} />
            </label>
        </div>
    );
  
  const FormSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <>
        <h4 className="text-md font-semibold text-gray-800 border-b pb-2 mb-4 pt-2">{title}</h4>
        {children}
    </>
  );

  // --- Form Render Functions ---

  const renderAdmissionFormFields = () => (
    <>
        <FormSection title="Dados Pessoais">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Nome Completo" name="fullName" value={admissionData.fullName} onChange={handleAdmissionInputChange} />
                <FormInput label="CPF" name="cpf" value={admissionData.cpf} onChange={handleAdmissionInputChange} />
                <FormInput label="Data de Nascimento" name="dob" value={admissionData.dob} onChange={handleAdmissionInputChange} type="date" />
                <FormInput label="Cor/Raça" name="race" value={admissionData.race} onChange={handleAdmissionInputChange} />
                <FormSelect label="Estado Civil" name="maritalStatus" value={admissionData.maritalStatus} onChange={handleAdmissionInputChange}>
                    <option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option><option>União Estável</option>
                </FormSelect>
                <FormInput label="Nome do Pai" name="fatherName" value={admissionData.fatherName} onChange={handleAdmissionInputChange} required={false}/>
                <FormInput label="Nome da Mãe" name="motherName" value={admissionData.motherName} onChange={handleAdmissionInputChange} />
                <FormInput label="Local de Nascimento" name="birthPlace" value={admissionData.birthPlace} onChange={handleAdmissionInputChange} />
            </div>
            <FormInput label="Endereço Completo" name="address" value={admissionData.address} onChange={handleAdmissionInputChange} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect label="Possui Filhos?" name="hasChildren" value={admissionData.hasChildren} onChange={handleAdmissionInputChange}>
                    <option value="não">Não</option><option value="sim">Sim</option>
                </FormSelect>
                 <FormInput label="RG" name="rg" value={admissionData.rg} onChange={handleAdmissionInputChange} />
            </div>
        </FormSection>
        <FormSection title="Documentos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <FormInput label="Carteira de Trabalho (Nº e Série)" name="ctps" value={admissionData.ctps} onChange={handleAdmissionInputChange} required={!admissionData.isCtpsDigital} disabled={admissionData.isCtpsDigital}/>
                <div className="flex items-center pb-2">
                    <input type="checkbox" id="isCtpsDigital" name="isCtpsDigital" checked={admissionData.isCtpsDigital} onChange={handleAdmissionInputChange} className="h-4 w-4 text-brand-primary rounded border-gray-300 focus:ring-brand-primary" />
                    <label htmlFor="isCtpsDigital" className="ml-2 block text-sm text-gray-900">CTPS é digital</label>
                </div>
                 <FormInput label="PIS" name="pis" value={admissionData.pis} onChange={handleAdmissionInputChange} />
                 <FormInput label="Título de Eleitor" name="voterId" value={admissionData.voterId} onChange={handleAdmissionInputChange} />
            </div>
        </FormSection>
        <FormSection title="Dados Contratuais">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Data de Admissão" name="admissionDate" value={admissionData.admissionDate} onChange={handleAdmissionInputChange} type="date" />
                <FormSelect label="Contrato de Experiência?" name="isTrial" value={admissionData.isTrial} onChange={handleAdmissionInputChange}>
                    <option value="sim">Sim</option><option value="não">Não</option>
                </FormSelect>
                <FormInput label="Função/Cargo" name="jobTitle" value={admissionData.jobTitle} onChange={handleAdmissionInputChange} />
                <FormInput label="Salário (R$)" name="salary" value={admissionData.salary} onChange={handleAdmissionInputChange} type="number" />
                <FormSelect label="Haverá Adiantamento Salarial?" name="hasAdvance" value={admissionData.hasAdvance} onChange={handleAdmissionInputChange}>
                    <option value="sim">Sim</option><option value="não">Não</option>
                </FormSelect>
                 <FormInput label="Horário de Trabalho" name="workSchedule" value={admissionData.workSchedule} onChange={handleAdmissionInputChange} />
            </div>
             <FileUploadInput label="ASO (Atestado de Saúde Ocupacional Admissional)" id="aso-upload" file={admissionData.asoFile} onChange={handleAdmissionFileChange} />
        </FormSection>
    </>
  );

  const renderDismissalFormFields = () => (
    <>
        <FormSection title="Dados do Desligamento">
            <div className="space-y-4">
                 <FormInput label="Nome do Funcionário" name="employeeName" value={dismissalData.employeeName} onChange={handleDismissalInputChange} />
                 <FormInput label="Data do Último Dia Trabalhado" name="lastDayWorked" value={dismissalData.lastDayWorked} onChange={handleDismissalInputChange} type="date" />
                 <FormSelect label="Tipo de Aviso Prévio" name="noticeType" value={dismissalData.noticeType} onChange={handleDismissalInputChange}>
                    <option value="indenizado">Indenizado</option>
                    <option value="trabalhado">Trabalhado</option>
                 </FormSelect>
                 <FormSelect label="Motivo da Demissão" name="reason" value={dismissalData.reason} onChange={handleDismissalInputChange}>
                    <option value="">Selecione o motivo</option>
                    <option value="sem justa causa">Dispensa sem justa causa</option>
                    <option value="a pedido">Pedido de demissão</option>
                    <option value="termino de contrato">Término de contrato de experiência</option>
                 </FormSelect>
                 <FileUploadInput label="ASO (Atestado de Saúde Ocupacional Demissional)" id="aso-dismissal-upload" file={dismissalData.asoFile} onChange={handleDismissalFileChange} />
            </div>
        </FormSection>
    </>
  );

  const renderDependentsFormFields = () => (
    <>
        {dependentsData.map((dependent, index) => (
             <div key={index} className="border p-4 rounded-md mb-4 relative space-y-4">
                 <h5 className="font-semibold">Dependente {index + 1}</h5>
                 {dependentsData.length > 1 && (
                     <button type="button" onClick={() => removeDependent(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
                 )}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Nome Completo" name="name" value={dependent.name} onChange={(e) => handleDependentChange(index, e)} />
                    <FormInput label="CPF" name="cpf" value={dependent.cpf} onChange={(e) => handleDependentChange(index, e)} />
                    <FormInput label="Data de Nascimento" name="dob" value={dependent.dob} onChange={(e) => handleDependentChange(index, e)} type="date" />
                    <FormSelect label="Parentesco" name="relationship" value={dependent.relationship} onChange={(e) => handleDependentChange(index, e)}>
                        <option value="">Selecione</option>
                        <option value="filho">Filho(a)</option>
                        <option value="conjuge">Cônjuge</option>
                        <option value="outro">Outro</option>
                    </FormSelect>
                </div>
             </div>
        ))}
        <button type="button" onClick={addDependent} className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">Adicionar Outro Dependente</button>
    </>
  );

  const renderContractChangeFormFields = () => (
    <>
        <FormSelect label="Tipo de Alteração" name="changeType" value={contractChangeData.changeType} onChange={handleContractChangeInputChange}>
            <option value="">Selecione o que deseja alterar</option>
            <option value="Endereço">Endereço</option>
            <option value="Capital Social">Capital Social</option>
            <option value="Sócios">Quadro Societário (Entrada/Saída de Sócio)</option>
            <option value="Atividades">Atividades/CNAE</option>
        </FormSelect>
        {contractChangeData.changeType && (
            <div className="mt-4 pt-4 border-t space-y-4">
                {contractChangeData.changeType === 'Endereço' && <FormInput label="Novo Endereço Completo" name="newAddress" value={contractChangeData.newAddress} onChange={handleContractChangeInputChange} />}
                {contractChangeData.changeType === 'Capital Social' && <FormInput label="Novo Valor do Capital Social (R$)" name="newCapital" value={contractChangeData.newCapital} onChange={handleContractChangeInputChange} type="number" />}
                {contractChangeData.changeType === 'Sócios' && <FormInput label="Descreva a Alteração (Quem entra/sai e com qual %)" name="newPartners" value={contractChangeData.newPartners} onChange={handleContractChangeInputChange} />}
                {contractChangeData.changeType === 'Atividades' && <FormInput label="Descreva as Novas Atividades" name="newActivities" value={contractChangeData.newActivities} onChange={handleContractChangeInputChange} />}
            </div>
        )}
    </>
  );

  const renderAssetFormFields = () => (
    <div className="space-y-4">
        <FormInput label="Descrição do Bem/Ativo" name="description" value={assetData.description} onChange={handleAssetInputChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormInput label="Data da Compra" name="purchaseDate" value={assetData.purchaseDate} onChange={handleAssetInputChange} type="date"/>
             <FormInput label="Valor da Compra (R$)" name="value" value={assetData.value} onChange={handleAssetInputChange} type="number"/>
        </div>
        <FormInput label="Número da Nota Fiscal" name="invoiceNumber" value={assetData.invoiceNumber} onChange={handleAssetInputChange} />
        <FileUploadInput label="Anexar Nota Fiscal" id="asset-invoice-upload" file={assetData.invoiceFile} onChange={handleAssetFileChange} />
    </div>
  );

  const renderFormContainer = (children: React.ReactNode) => (
    <div className="pt-4 border-t mt-4">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3 -mr-3">
        {children}
      </div>
    </div>
  );

  const renderSelectedForm = () => {
    switch (selectedDocument) {
        case 'Ficha de Registro de Empregado (FRE)':
            return renderFormContainer(renderAdmissionFormFields());
        case 'Comunicação de dispensa / seguro-desemprego':
            return renderFormContainer(renderDismissalFormFields());
        case 'Declaração de dependentes (IR e salário-família)':
            return renderFormContainer(renderDependentsFormFields());
        case 'Alteração Contratual (mudança de sócios, endereço, capital, objeto etc.)':
            return renderFormContainer(renderContractChangeFormFields());
        case 'Documentos de depreciação / ativos fixos':
            return renderFormContainer(renderAssetFormFields());
        default:
            return null;
    }
  }
  
  const getModalTitle = () => {
    if (!isFormSelected) return "Enviar Novo Documento";
    const titleMap: { [key: string]: string } = {
        'Ficha de Registro de Empregado (FRE)': 'Formulário de Admissão',
        'Comunicação de dispensa / seguro-desemprego': 'Formulário de Demissão',
        'Declaração de dependentes (IR e salário-família)': 'Declaração de Dependentes',
        'Alteração Contratual (mudança de sócios, endereço, capital, objeto etc.)': 'Solicitação de Alteração Contratual',
        'Documentos de depreciação / ativos fixos': 'Cadastro de Novo Ativo Fixo'
    };
    return titleMap[selectedDocument] || "Enviar Documento";
  }
  
  const getFileUploadLabel = () => {
    const restriction = fileTypeRestrictions[selectedDocument];
    if (restriction) {
        return `Arquivo (apenas ${restriction})`;
    }
    return "Arquivo";
  };


  const renderSelects = () => {
    const selectBaseClasses = "w-full bg-white rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary sm:text-sm appearance-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

    const ChevronDownIcon = () => (
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    );
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="docCategory" className="block text-sm font-medium text-gray-700">Setor</label>
          <div className="mt-1 relative">
            <select id="docCategory" value={selectedCategory} onChange={handleCategoryChange} className={`${selectBaseClasses} ${!selectedCategory ? 'text-gray-400' : 'text-gray-900'} border border-gray-300`}>
              <option value="">Selecione um Setor</option>
              {documentCategories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
            </select>
            <ChevronDownIcon />
          </div>
        </div>
        <div>
          <label htmlFor="docSubCategory" className="block text-sm font-medium text-gray-700">Subcategoria</label>
          <div className="mt-1 relative">
            <select id="docSubCategory" value={selectedSubCategory} onChange={handleSubCategoryChange} disabled={!selectedCategory} className={`${selectBaseClasses} ${!selectedSubCategory ? 'text-gray-400' : 'text-gray-900'} border ${!!selectedCategory && !selectedSubCategory ? 'border-brand-primary' : 'border-gray-300'}`}>
              <option value="">Selecione uma Subcategoria</option>
              {subCategoryOptions.map(sub => <option key={sub.name} value={sub.name}>{sub.name}</option>)}
            </select>
            <ChevronDownIcon />
          </div>
        </div>
        <div>
          <label htmlFor="docName" className="block text-sm font-medium text-gray-700">Documento</label>
          <div className="mt-1 relative">
            <select id="docName" value={selectedDocument} onChange={(e) => setSelectedDocument(e.target.value)} disabled={!selectedSubCategory} className={`${selectBaseClasses} ${!selectedDocument ? 'text-gray-400' : 'text-gray-900'} border ${!!selectedSubCategory && !selectedDocument ? 'border-brand-primary' : 'border-gray-300'}`}>
              <option value="">Selecione um Documento</option>
              {documentOptions.map(doc => <option key={doc.name} value={doc.name}>{doc.name}</option>)}
            </select>
            <ChevronDownIcon />
          </div>
        </div>
      </div>
    );
  };
  
  const TabButton: React.FC<{label: string, tabName: string}> = ({
    label,
    tabName,
  }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
        activeTab === tabName
          ? 'border-brand-primary text-brand-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Documentos</h2>
        <div className="flex space-x-2">
            <button onClick={() => { resetSelections(); setRequestModalOpen(true); }} className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300 text-sm">Solicitar Documento</button>
            <button onClick={() => { resetSelections(); setUploadModalOpen(true); }} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm">Enviar Documento</button>
        </div>
      </div>

       {user.role === UserRole.ADMIN && (
        <div className="mt-4">
            <input
                type="text"
                placeholder="Pesquisar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
        </div>
    )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <TabButton label="Enviados/Solicitados pelo Cliente" tabName="client" />
                  <TabButton label="Enviados/Solicitados pelo Escritório" tabName="office" />
              </nav>
            </div>
        </div>

        <div className="p-6">
           {user.role === UserRole.ADMIN ? (
                <div className="space-y-4">
                    {Object.entries(groupedDocs).map(([clientName, clientDocs]) => (
                        <div key={clientName} className="border rounded-md overflow-hidden bg-white">
                            <button onClick={() => toggleClient(clientName)} className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none">
                                <span className="font-semibold text-gray-700">{clientName} ({clientDocs.length} documentos)</span>
                                <ChevronDownIcon className={`w-5 h-5 transition-transform text-gray-500 ${openClients.includes(clientName) ? 'rotate-180' : ''}`} />
                            </button>
                            {openClients.includes(clientName) && (
                               <div className="p-2">
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                      <tr>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Arquivo</th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enviado por</th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                          <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                      </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                      {clientDocs.map((doc) => (
                                          <tr key={doc.id}>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadedBy}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadDate}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge status={doc.status} /></td>
                                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                              {user.role === UserRole.ADMIN && doc.status === 'Pending' && (
                                                  <button onClick={() => handleApproveDocument(doc.id)} className="px-2 py-1 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">Aprovar</button>
                                              )}
                                              <button onClick={() => alert(`Iniciando download de ${doc.name}...`)} className="px-2 py-1 text-xs font-medium rounded-md text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors">Download</button>
                                          </td>
                                          </tr>
                                      ))}
                                      </tbody>
                                  </table>
                                </div>
                               </div>
                            )}
                        </div>
                    ))}
                    {Object.keys(groupedDocs).length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>Nenhum documento encontrado para os critérios de busca.</p>
                        </div>
                    )}
                </div>
           ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                  <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Arquivo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enviado por</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {documentsToDisplay.map((doc) => (
                      <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadedBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.uploadDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge status={doc.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button onClick={() => alert(`Iniciando download de ${doc.name}...`)} className="px-2 py-1 text-xs font-medium rounded-md text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors">Download</button>
                      </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
              {documentsToDisplay.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                      <p>Nenhum documento encontrado nesta categoria.</p>
                  </div>
              )}
            </div>
           )}
        </div>
      </div>
      {isUploadModalOpen && (
        <Modal 
            title={getModalTitle()}
            onClose={() => setUploadModalOpen(false)}
            large={true}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {renderSelects()}
                
                {renderSelectedForm()}
                
                {selectedDocument && !isFormSelected && (
                    <div className="pt-4 border-t mt-4">
                       <FileUploadInput 
                           label={getFileUploadLabel()}
                           id="file-upload" 
                           file={selectedFile} 
                           onChange={handleFileChange}
                           accept={fileTypeRestrictions[selectedDocument] || '*'}
                        />
                    </div>
                )}
                
                <div className="flex justify-end pt-4">
                    <button type="submit" 
                        disabled={!selectedDocument || (!isFormSelected && !selectedFile)} 
                        className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
                        Enviar
                    </button>
                </div>
            </form>
        </Modal>
      )}
      {isRequestModalOpen && (
        <Modal title="Solicitar Documento" onClose={() => setRequestModalOpen(false)}>
            <form onSubmit={handleRequest} className="space-y-4">
                <div className="md:grid-cols-1 grid gap-4">
                 {renderSelects()}
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={!selectedDocument} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 disabled:bg-gray-400 transition-colors duration-200">Solicitar</button>
                </div>
            </form>
        </Modal>
      )}
    </div>
  );
};

export default DocumentsPage;