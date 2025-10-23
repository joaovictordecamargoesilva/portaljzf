import React, { useState, useEffect } from 'react';
import { Employee } from '../types.ts';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
    large?: boolean;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title, large = false }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className={`bg-white rounded-lg shadow-xl w-full ${large ? 'max-w-xl' : 'max-w-md'}`}>
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold text-black">{title}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
);

interface FileUploadAreaProps {
    onFileSelect: (files: FileList | null) => void;
    acceptedTypes: string;
    isMultiple: boolean;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFileSelect, acceptedTypes, isMultiple }) => (
    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
        <span className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="font-medium text-gray-600">
                Arraste e solte seus arquivos aqui ou <span className="text-blue-600 underline">clique para selecionar</span>
            </span>
        </span>
        <input id="file-upload" type="file" className="hidden" accept={acceptedTypes} multiple={isMultiple} onChange={(e) => onFileSelect(e.target.files)} />
    </label>
);


const PayrollPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  const [isBatchImportModalOpen, setBatchImportModalOpen] = useState(false);
  const [isTimesheetModalOpen, setTimesheetModalOpen] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [timesheetFiles, setTimesheetFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [salary, setSalary] = useState('');

  useEffect(() => {
    if (editingEmployee) {
      setName(editingEmployee.name);
      setRole(editingEmployee.role);
      setSalary(editingEmployee.salary.toString());
    } else {
      setName('');
      setRole('');
      setSalary('');
    }
  }, [editingEmployee]);
  
  const handleOpenModal = (employee: Employee | null) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salaryNumber = parseFloat(salary);
    if (!name || !role || isNaN(salaryNumber)) return;

    if (editingEmployee) {
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? { ...emp, name, role, salary: salaryNumber } : emp));
    } else {
        const newEmployee: Employee = {
            id: (employees.length + 1).toString(),
            name,
            role,
            salary: salaryNumber
        };
        setEmployees([newEmployee, ...employees]);
    }
    handleCloseModal();
  };
  
  const handleBatchImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFile) return;
    setIsProcessing(true);
    setTimeout(() => {
        // Simula funcionários lidos do arquivo Excel.
        // Inclui um funcionário existente ('Ana Carolina') e dois novos.
        const employeesFromSheet = [
            { name: 'Ana Carolina', role: 'Gerente de Vendas', salary: 7500.00 },
            { name: 'Maria Souza (Nova)', role: 'Contadora', salary: 6000 },
            { name: 'Pedro Costa (Novo)', role: 'Assistente Fiscal', salary: 3500 },
        ];

        // Cria um conjunto de nomes de funcionários existentes para uma busca eficiente.
        const existingEmployeeNames = new Set(employees.map(emp => emp.name.toLowerCase()));
        
        // Filtra para adicionar apenas os funcionários que ainda não existem.
        const newEmployeesToAdd: Employee[] = employeesFromSheet
            .filter(sheetEmp => !existingEmployeeNames.has(sheetEmp.name.toLowerCase()))
            .map((emp, index) => ({
                ...emp,
                id: (employees.length + 1 + index).toString(),
            }));
        
        let alertMessage = '';
        if (newEmployeesToAdd.length > 0) {
            setEmployees(prev => [...newEmployeesToAdd, ...prev]);
            alertMessage = `${newEmployeesToAdd.length} novo(s) funcionário(s) importado(s) com sucesso! Funcionários duplicados foram ignorados.`;
        } else {
            alertMessage = 'Nenhum novo funcionário encontrado na planilha. Todos os funcionários já estavam cadastrados.';
        }

        setIsProcessing(false);
        setBatchImportModalOpen(false);
        setBatchFile(null);
        alert(alertMessage);
    }, 2000);
  };

  const handleTimesheetImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (timesheetFiles.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        setTimesheetModalOpen(false);
        setTimesheetFiles([]);
        alert('Arquivos recebidos! A análise por IA foi iniciada e os dados serão processados em breve.');
    }, 3000);
  };

  const ProcessingButton: React.FC<{ text: string }> = ({ text }) => (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {text}
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Folha de Ponto e Funcionários</h2>
        <div className="flex items-center space-x-2">
            <button onClick={() => setTimesheetModalOpen(true)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">Importar Folha de Ponto</button>
            <button onClick={() => setBatchImportModalOpen(true)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">Importar Funcionários</button>
            <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm">Adicionar Funcionário</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salário</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length > 0 ? employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {employee.salary.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleOpenModal(employee); }} className="text-brand-primary hover:text-opacity-80">Editar</a>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500">Nenhum funcionário cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <Modal title={editingEmployee ? "Editar Funcionário" : "Adicionar Funcionário"} onClose={handleCloseModal}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="empName" className="block text-sm font-medium text-gray-700">Nome</label>
                    <input type="text" id="empName" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="empRole" className="block text-sm font-medium text-gray-700">Cargo</label>
                    <input type="text" id="empRole" value={role} onChange={(e) => setRole(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="empSalary" className="block text-sm font-medium text-gray-700">Salário (R$)</label>
                    <input type="number" id="empSalary" value={salary} onChange={(e) => setSalary(e.target.value)} required min="0" step="100" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90">Salvar</button>
                </div>
            </form>
        </Modal>
      )}

      {isBatchImportModalOpen && (
        <Modal title="Importar Funcionários em Lote" onClose={() => setBatchImportModalOpen(false)}>
            <form onSubmit={handleBatchImport} className="space-y-4">
                <p className="text-sm text-gray-600">
                    Faça o upload de uma planilha Excel (.xlsx) com a lista de funcionários. A planilha deve conter as colunas: <code className="text-xs bg-gray-100 p-1 rounded">Nome</code>, <code className="text-xs bg-gray-100 p-1 rounded">Cargo</code> e <code className="text-xs bg-gray-100 p-1 rounded">Salario</code>.
                </p>
                <a href="#" className="text-sm text-blue-600 hover:underline">Baixar modelo da planilha</a>
                <FileUploadArea onFileSelect={(files) => files && setBatchFile(files[0])} acceptedTypes=".xlsx" isMultiple={false} />
                {batchFile && <p className="text-sm text-gray-500">Arquivo selecionado: {batchFile.name}</p>}
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={() => setBatchImportModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" disabled={!batchFile || isProcessing} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 disabled:bg-gray-400 flex items-center justify-center w-36">
                       {isProcessing ? <ProcessingButton text="Processando..." /> : 'Processar Planilha'}
                    </button>
                </div>
            </form>
        </Modal>
      )}

      {isTimesheetModalOpen && (
        <Modal title="Importar Folha de Ponto" onClose={() => setTimesheetModalOpen(false)} large>
            <form onSubmit={handleTimesheetImport} className="space-y-4">
                 <p className="text-sm text-gray-600">
                    Carregue a planilha ou as imagens das folhas de ponto digitais. Nossa IA irá analisar os dados e atribuí-los aos funcionários correspondentes.
                </p>
                <FileUploadArea onFileSelect={(files) => files && setTimesheetFiles(Array.from(files))} acceptedTypes=".xlsx,.csv,.png,.jpg,.jpeg" isMultiple={true} />
                {timesheetFiles.length > 0 && (
                    <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                        <p className="text-sm font-medium text-gray-700">Arquivos selecionados:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                            {timesheetFiles.map(file => <li key={file.name}>{file.name}</li>)}
                        </ul>
                    </div>
                )}
                 <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={() => setTimesheetModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button type="submit" disabled={timesheetFiles.length === 0 || isProcessing} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 disabled:bg-gray-400 flex items-center justify-center w-36">
                       {isProcessing ? <ProcessingButton text="Analisando..." /> : 'Analisar com IA'}
                    </button>
                </div>
            </form>
        </Modal>
      )}

    </div>
  );
};

export default PayrollPage;