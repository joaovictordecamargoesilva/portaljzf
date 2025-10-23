import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, User, Task } from '../types.ts';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Fix: Changed id type to string | number to match the Task interface.
  onSubmit: (data: Omit<Task, 'id' | 'completed'>, id?: string | number) => void;
  initialData: Task | null;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setDueDate(initialData.dueDate);
      setClientName(initialData.clientName!);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setClientName('');
    }
  }, [initialData, isOpen]);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !dueDate || !clientName) {
      alert('Por favor, preencha todos os campos, incluindo o cliente.');
      return;
    }
    onSubmit({ title, description, dueDate, clientName }, initialData?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Atribuir para o Cliente</label>
              <input 
                type="text"
                id="clientName" 
                value={clientName} 
                placeholder="Nome da empresa cliente"
                onChange={(e) => setClientName(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
              <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm">Salvar Tarefa</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  // Fix: Changed taskId type to string | number to match the Task interface.
  onUploadSuccess: (taskId: string | number) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  task,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) {
        setFile(null);
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Por favor, selecione um arquivo.');
      return;
    }
    // Simulate upload
    alert(`Arquivo "${file.name}" para a tarefa "${task.title}" foi enviado com sucesso para o administrador.`);
    onUploadSuccess(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Enviar arquivo para a tarefa</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <p className="font-medium text-gray-800">{task.title}</p>
              <p className="text-sm text-gray-500">{task.description}</p>
            </div>
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">Anexar arquivo</label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-opacity-90 cursor-pointer"
              />
              {file && <p className="text-xs text-gray-500 mt-1">Selecionado: {file.name}</p>}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-b-lg flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm" disabled={!file}>Enviar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const TasksPage: React.FC<{ user: User }> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [openClients, setOpenClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTaskForUpload, setSelectedTaskForUpload] = useState<Task | null>(null);


  const toggleClient = (clientName: string) => {
    setOpenClients(prev =>
      prev.includes(clientName)
        ? prev.filter(name => name !== clientName)
        : [...prev, clientName]
    );
  };

  const tasksToDisplay = useMemo(() => {
    if (user.role === UserRole.ADMIN) {
        return tasks;
    }
    return tasks.filter(task => task.clientName === user.companyName);
  }, [user, tasks]);

  const filteredTasks = useMemo(() => {
    if (user.role !== UserRole.ADMIN || !searchTerm) {
        return tasksToDisplay;
    }
    return tasksToDisplay.filter(task =>
        task.clientName!.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tasksToDisplay, searchTerm, user.role]);

  const groupedTasks = useMemo(() => {
    if (user.role !== UserRole.ADMIN) return {};
    return filteredTasks.reduce((acc, task) => {
      const key = task.clientName!;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {} as { [key: string]: Task[] });
  }, [filteredTasks, user.role]);


  // Fix: Changed taskId type to string | number to match the Task interface.
  const toggleTask = (taskId: string | number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Fix: Changed taskId type to string | number to match the Task interface.
  const markTaskAsCompleted = (taskId: string | number) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId ? { ...task, completed: true } : task
    ));
  };
  
  const handleOpenModal = (task: Task | null) => {
    setEditingTask(task);
    setCreateModalOpen(true);
  }

  const handleOpenUploadModal = (task: Task) => {
    setSelectedTaskForUpload(task);
    setUploadModalOpen(true);
  };

  // Fix: Changed id type to string | number to match the Task interface.
  const handleSaveTask = (data: Omit<Task, 'id' | 'completed'>, id?: string | number) => {
    if (id) {
        setTasks(prev => prev.map(task => task.id === id ? { ...task, ...data, completed: task.completed } : task));
        alert('Tarefa atualizada com sucesso!');
    } else {
        const newTask: Task = {
            ...data,
            id: `admin-task-${Date.now()}`,
            completed: false,
        };
        setTasks(prev => [newTask, ...prev]);
        alert('Tarefa criada com sucesso!');
    }
    setCreateModalOpen(false);
  };
  
  // Fix: Changed id type to string | number to match the Task interface.
  const handleDeleteTask = (id: string | number) => {
    if (window.confirm('Tem certeza de que deseja excluir esta tarefa?')) {
      setTasks(prev => prev.filter(task => task.id !== id));
    }
  };

  const ChevronDownIcon: React.FC<{className: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestão de Tarefas Mensais</h2>
        {user.role === UserRole.ADMIN && (
          <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-opacity-90 text-sm">Criar Nova Tarefa</button>
        )}
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        {user.role === UserRole.ADMIN ? (
          <div className="space-y-4">
            {Object.keys(groupedTasks).length > 0 ? Object.entries(groupedTasks).map(([clientName, clientTasks]) => (
              <div key={clientName} className="border rounded-md bg-white overflow-hidden">
                <button onClick={() => toggleClient(clientName)} className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none">
                  <span className="font-semibold text-gray-700">{clientName} ({clientTasks.length} tarefas)</span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform text-gray-500 ${openClients.includes(clientName) ? 'rotate-180' : ''}`} />
                </button>
                {openClients.includes(clientName) && (
                  <ul className="divide-y divide-gray-200">
                    {clientTasks.map(task => (
                      <li key={task.id} className="py-4 px-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id={`task-${task.id}`}
                            type="checkbox"
                            checked={task.completed}
                            className="h-5 w-5 text-brand-primary rounded border-gray-300 focus:ring-brand-primary cursor-not-allowed"
                            disabled={true} // Admin can't complete tasks
                          />
                          <div className="ml-4">
                            <label htmlFor={`task-${task.id}`} className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.title}
                            </label>
                            <p className="text-sm text-gray-500">{task.description}</p>
                            <p className="text-xs text-gray-400">Vence em: {task.dueDate}</p>
                          </div>
                        </div>
                        <div className="space-x-4">
                            <button onClick={() => handleOpenModal(task)} className="text-brand-primary hover:text-opacity-80 text-sm font-medium">Editar</button>
                            <button onClick={() => handleDeleteTask(task.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Excluir</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )) : <p className="text-center py-8 text-gray-500">Nenhum cliente com tarefas encontradas.</p>}
          </div>
        ) : (
          // Client view
          <ul className="space-y-4">
            {tasksToDisplay.length > 0 ? tasksToDisplay.map(task => (
                <li key={task.id} className={`p-4 rounded-md flex items-center justify-between transition-colors ${task.completed ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div className="flex items-center">
                        <input
                            id={`task-${task.id}`}
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="h-5 w-5 text-brand-primary rounded border-gray-300 focus:ring-brand-primary"
                        />
                        <div className="ml-4">
                        <label htmlFor={`task-${task.id}`} className={`font-medium cursor-pointer ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                        </label>
                        <p className="text-sm text-gray-500">{task.description}</p>
                        <p className="text-xs text-gray-400">Vence em: {task.dueDate}</p>
                        </div>
                    </div>
                    {!task.completed && (
                        <button 
                            onClick={() => handleOpenUploadModal(task)}
                            className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-md hover:bg-brand-primary/20"
                        >
                            Anexar Arquivo
                        </button>
                    )}
                </li>
            )) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">Nenhuma tarefa pendente para você no momento.</p>
                </div>
            )}
          </ul>
        )}
      </div>
      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleSaveTask}
        initialData={editingTask}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        task={selectedTaskForUpload}
        onUploadSuccess={markTaskAsCompleted}
      />
    </div>
  );
};

export default TasksPage;