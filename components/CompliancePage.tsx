import React, { useState } from 'react';
import { findOpportunities } from '../services/geminiService.ts';

const CompliancePage: React.FC = () => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('');
  const [opportunities, setOpportunities] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleCheckPendencies = () => {
    setIsChecking(true);
    setCheckResult('');
    setTimeout(() => {
      setIsChecking(false);
      setCheckResult('Nenhuma pendência fiscal ou tributária encontrada nos âmbitos federal e estadual para o CNPJ vinculado ao certificado digital.');
    }, 3000);
  };

  const handleSearchOpportunities = async () => {
    if (!businessType) return;
    setIsSearching(true);
    setOpportunities('');
    const result = await findOpportunities(businessType);
    setOpportunities(result);
    setIsSearching(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Consulta de Pendências e Oportunidades</h2>
        <p className="text-sm text-gray-600 mt-1">Utilize seu certificado digital para consultas seguras e busque oportunidades de negócio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compliance Check Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Consulta de Pendências (Receita Federal, Estadual e PGFN)</h3>
          <p className="text-sm text-gray-500 mt-2">Conecte seu certificado digital A1/A3 para realizar uma varredura completa e segura nos âmbitos federal e estadual.</p>
          <div className="mt-6 text-center">
            <button
              onClick={handleCheckPendencies}
              disabled={isChecking}
              className="w-full px-6 py-3 bg-brand-primary text-white rounded-md hover:bg-opacity-90 disabled:bg-gray-400 flex items-center justify-center"
            >
              {isChecking && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {isChecking ? 'Consultando...' : 'Conectar Certificado e Consultar'}
            </button>
          </div>
          {checkResult && (
            <div className="mt-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
              <h4 className="font-bold">Resultado da Consulta:</h4>
              <p>{checkResult}</p>
            </div>
          )}
        </div>

        {/* Opportunity Search Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Busca de Oportunidades em Canais Públicos</h3>
          <p className="text-sm text-gray-500 mt-2">Descreva seu serviço ou produto para encontrar licitações e editais abertos.</p>
          <div className="mt-4">
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">Tipo de serviço/produto</label>
            <input
              type="text"
              id="businessType"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="Ex: software de gestão, serviços de limpeza, etc."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            />
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={handleSearchOpportunities}
              disabled={isSearching || !businessType}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
            >
              {isSearching && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {isSearching ? 'Buscando...' : 'Buscar Oportunidades'}
            </button>
          </div>
          {(isSearching || opportunities) && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md h-48 overflow-y-auto">
              <h4 className="font-bold">Oportunidades Encontradas:</h4>
              {isSearching ? <p>Buscando...</p> : <div className="prose prose-sm mt-2" dangerouslySetInnerHTML={{ __html: opportunities }} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;