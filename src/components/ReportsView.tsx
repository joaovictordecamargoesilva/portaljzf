import React, { useState, useEffect, useRef } from 'react';
import { User, Client, Opportunity, ComplianceFinding } from '../types';
import * as api from '../services/api';
import Icon from './Icon';

interface ReportsViewProps {
  currentUser: User;
  clients: Client[];
  opportunities: Opportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
  complianceFindings: ComplianceFinding[];
  setComplianceFindings: React.Dispatch<React.SetStateAction<ComplianceFinding[]>>;
  isRadarRunning: boolean;
  activeClientId: number | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentUser, clients, opportunities, setOpportunities, complianceFindings, setComplianceFindings, isRadarRunning, activeClientId }) => {
    const [isLoadingOpps, setIsLoadingOpps] = useState(false);
    const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef<number | null>(null);

    // Cooldown timer effect
    useEffect(() => {
        if (cooldown > 0) {
            timerRef.current = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [cooldown]);

    const handleManualSearch = async () => {
        if (!activeClientId || isLoadingOpps || isRadarRunning || cooldown > 0) return;
        
        const client = clients.find(c => c.id === activeClientId);
        if (!client) return;

        setIsLoadingOpps(true);
        try {
            const foundOpps: Omit<Opportunity, 'id' | 'clientId' | 'dateFound'>[] = await api.findFinancialOpportunities(client);
            const newOpportunities: Opportunity[] = foundOpps.filter(found => 
                !opportunities.some(existing => 
                    existing.clientId === client.id && 
                    existing.title === found.title && 
                    existing.source === found.source
                )
            ).map((opp) => ({
                ...opp,
                id: `OPP-${Date.now()}-${Math.random()}`,
                clientId: client.id,
                dateFound: new Date().toISOString(),
            } as Opportunity));

            if(newOpportunities.length > 0) {
                setOpportunities(prev => [...prev, ...newOpportunities]);
            } else {
                alert("Nenhuma oportunidade *nova* foi encontrada para sua empresa no momento.");
            }

        } catch (error) {
            console.error("Error during manual search:", error);
            alert("Ocorreu um erro ao buscar oportunidades. A API pode estar temporariamente indisponível ou os limites de uso foram atingidos.");
        } finally {
            setIsLoadingOpps(false);
            setCooldown(60);
        }
    };
    
    const handleCheckCompliance = async () => {
        if (!activeClientId || isCheckingCompliance) return;
        
        const client = clients.find(c => c.id === activeClientId);
        if (!client) return;
    
        setIsCheckingCompliance(true);
    
        try {
            const foundFindings: Omit<ComplianceFinding, 'id' | 'clientId' | 'dateChecked'>[] = await api.checkCompliance(client);
            const newFindings: ComplianceFinding[] = foundFindings.filter(found => 
                !complianceFindings.some(existing => 
                    existing.clientId === client.id && 
                    existing.title === found.title &&
                    existing.summary === found.summary
                )
            ).map((finding) => ({
                ...finding,
                id: `COMP-${Date.now()}-${Math.random()}`,
                clientId: client.id,
                dateChecked: new Date().toISOString(),
            } as ComplianceFinding));
    
            if (newFindings.length > 0) {
                setComplianceFindings(prev => [...prev, ...newFindings]);
            } else {
                alert("Nenhuma pendência ou atualização de conformidade *nova* foi encontrada.");
            }
        } catch (error) {
            console.error("Error during compliance check:", error);
            alert("Ocorreu um erro ao verificar a conformidade. A API pode estar indisponível ou os limites de uso foram atingidos.");
        } finally {
            setIsCheckingCompliance(false);
        }
    };

    const clientForView = clients.find(c => c.id === activeClientId);
    const clientOpportunities = opportunities.filter(o => o.clientId === activeClientId);
    const clientComplianceFindings = complianceFindings.filter(f => f.clientId === activeClientId);

    return (
        <div>
            <h2 className="text-3xl font-bold text-black mb-6">Análise & IA</h2>

            {!activeClientId && (
                 <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <Icon path="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-text-primary">Selecione um Cliente</h3>
                    <p className="text-text-secondary mt-2">Para usar as ferramentas de Análise e IA, por favor, selecione um cliente na barra de navegação superior.</p>
                </div>
            )}
            
            {clientForView && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Opportunities Section */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                             <div>
                                <h3 className="text-xl font-bold text-black">Radar de Oportunidades</h3>
                                <p className="text-sm text-gray-500">Busque por incentivos fiscais e licitações.</p>
                             </div>
                             <button onClick={handleManualSearch} disabled={isLoadingOpps || cooldown > 0} className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className="w-5 h-5 mr-2" />
                                {isLoadingOpps ? 'Buscando...' : (cooldown > 0 ? `Aguarde ${cooldown}s` : 'Buscar Novas')}
                            </button>
                        </div>
                        <ul className="space-y-3 max-h-96 overflow-y-auto">
                            {clientOpportunities.length > 0 ? clientOpportunities.map(opp => (
                                <li key={opp.id} className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="font-bold text-primary">{opp.title}</p>
                                    <p className="text-sm text-gray-700 my-1">{opp.description}</p>
                                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                        <a href={opp.source} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">Ver Fonte</a>
                                        {opp.submissionDeadline && <span>Prazo: {new Date(opp.submissionDeadline).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>}
                                    </div>
                                </li>
                            )) : <p className="text-center text-gray-500 py-4">Nenhuma oportunidade encontrada. Clique em "Buscar Novas" para pesquisar.</p>}
                        </ul>
                    </div>

                    {/* Compliance Section */}
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                             <div>
                                <h3 className="text-xl font-bold text-black">Verificador de Conformidade</h3>
                                <p className="text-sm text-gray-500">Verifique pendências e atualizações fiscais.</p>
                            </div>
                            <button onClick={handleCheckCompliance} disabled={isCheckingCompliance} className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                                <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 mr-2" />
                                {isCheckingCompliance ? 'Verificando...' : 'Verificar Agora'}
                            </button>
                        </div>
                         <ul className="space-y-3 max-h-96 overflow-y-auto">
                            {clientComplianceFindings.length > 0 ? clientComplianceFindings.map(finding => {
                                const statusStyles: Record<string, { bg: string, text: string, icon: string }> = {
                                    'Pendencia': {bg: 'bg-red-100', text: 'text-red-800', icon: 'M12 9v2m0 4h.01'},
                                    'Atencao': {bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'M13 16h-1v-4h-1m1-4h.01'},
                                    'OK': {bg: 'bg-green-100', text: 'text-green-800', icon: 'M5 13l4 4L19 7'},
                                    'Informativo': {bg: 'bg-blue-100', text: 'text-blue-800', icon: 'M13 16h-1v-4h-1m1-4h.01'},
                                };
                                const style = statusStyles[finding.status] || statusStyles['Informativo'];

                                return (
                                <li key={finding.id} className="p-4 bg-gray-50 rounded-lg border">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-primary">{finding.title}</p>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}>{finding.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 my-1">{finding.summary}</p>
                                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                         <a href={finding.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">Ver Fonte</a>
                                         <span>Verificado em: {new Date(finding.dateChecked).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </li>
                            )}) : <p className="text-center text-gray-500 py-4">Nenhum item de conformidade encontrado. Clique em "Verificar Agora".</p>}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
