import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToSimulator } from '../services/geminiService.ts';
import { ChatMessage } from '../types.ts';

const SimulationPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Olá! Sou o Simulador JZF. Que cenário financeiro você gostaria de analisar hoje?' }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botResponseText = await sendMessageToSimulator(input);
    const botMessage: ChatMessage = { sender: 'bot', text: botResponseText };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Simulação de Cenário</h2>
        <p className="text-sm text-gray-600 mt-1">Converse com nosso simulador para entender o impacto financeiro de suas decisões.</p>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
        {/* Messages Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold flex-shrink-0">S</div>
                )}
                <div className={`max-w-[85%] p-3 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex items-end gap-2 justify-start">
                   <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold flex-shrink-0">S</div>
                   <div className="max-w-[85%] p-3 rounded-lg bg-white text-gray-800 shadow-sm">
                      <div className="flex items-center space-x-1">
                          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <footer className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Descreva o cenário que você quer simular..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend} 
              className="px-6 py-2 bg-brand-primary text-white rounded-full hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" 
              disabled={isLoading || input.trim() === ''}
            >
              Enviar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SimulationPage;