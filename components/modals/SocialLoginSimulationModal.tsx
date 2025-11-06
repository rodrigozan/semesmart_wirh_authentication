import React, { useState } from 'react';
import { CloseIcon, GoogleIcon } from '../common/Icons';

interface SocialLoginSimulationModalProps {
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const SocialLoginSimulationModal: React.FC<SocialLoginSimulationModalProps> = ({ onClose, onSubmit }) => {
    const [email, setEmail] = useState('familia.silva@google.com');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            onSubmit(email);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <GoogleIcon /> Simular Login
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    Como esta é uma aplicação de demonstração sem um backend real, por favor, insira um e-mail para simular a autenticação com o Google.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="social-email" className="block text-sm font-medium text-gray-700">E-mail da Conta Google</label>
                        <input 
                          type="email" 
                          id="social-email" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                          required 
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-700">
                            Continuar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SocialLoginSimulationModal;
