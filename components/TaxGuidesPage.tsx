import React, { useState, useMemo } from 'react';
import { User, TaxGuide } from '../types.ts';

const initialGuides: TaxGuide[] = [];

interface TaxGuidesPageProps {
    user: User;
}

const TaxGuidesPage: React.FC<TaxGuidesPageProps> = ({ user }) => {
    const [guides, setGuides] = useState<TaxGuide[]>(initialGuides);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const filteredGuides = useMemo(() => {
        if (!user.taxRegime) {
            return [];
        }
        return guides.filter(guide => 
            guide.regime === user.taxRegime || guide.regime === 'Todos'
        );
    }, [guides, user.taxRegime]);
    
    const handleFetchGuides = () => {
        setIsFetching(true);
        setTimeout(() => {
            alert("Novas guias foram buscadas e adicionadas à lista (simulação).");
            // Here you would typically fetch from a real API and update the state
            // setGuides(newGuidesFromApi);
            setIsFetching(false);
        }, 2500);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Geração de Guias</h2>
                  <p className="text-sm text-gray-500">Regime Tributário: <span className="font-semibold">{user.taxRegime || 'Não definido'}</span></p>
                </div>
                <button 
                    onClick={handleFetchGuides}
                    disabled={isFetching}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm disabled:bg-gray-400 flex items-center"
                >
                    {isFetching && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    {isFetching ? 'Buscando...' : 'Baixar Guias do Governo (Certificado Digital)'}
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Guia</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês de Referência</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Emissão</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Download</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredGuides.map((guide) => (
                                <tr key={guide.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{guide.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guide.referenceMonth}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{guide.issueDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href={guide.downloadUrl} className="text-brand-primary hover:text-opacity-80">Baixar PDF</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredGuides.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>Nenhuma guia encontrada para o seu regime tributário.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaxGuidesPage;