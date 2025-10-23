import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToBot } from '../services/geminiService.ts';
import { BotIcon } from './icons.tsx';
import { ChatMessage } from '../types.ts';

const VirtualAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Olá! Sou o assistente virtual da JZF. Como posso ajudar?' }
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

    const botResponseText = await sendMessageToBot(input);
    const botMessage: ChatMessage = { sender: 'bot', text: botResponseText };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-brand-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-opacity-90 transition-transform transform hover:scale-110"
        >
          <BotIcon className="w-8 h-8" />
        </button>
      </div>
      
      {isOpen && (
        <div className="fixed bottom-28 right-8 z-50 w-full max-w-sm h-[60vh] bg-white rounded-lg shadow-2xl flex flex-col">
          <header className="bg-brand-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Assistente Virtual JZF</h3>
            <button onClick={() => setIsOpen(false)} className="text-xl font-bold">&times;</button>
          </header>
          
          <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800">
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

          <footer className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua dúvida..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              />
              <button onClick={handleSend} className="px-4 py-2 bg-brand-primary text-white rounded-r-md hover:bg-opacity-90 disabled:bg-gray-400" disabled={isLoading}>
                Enviar
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default VirtualAssistant;