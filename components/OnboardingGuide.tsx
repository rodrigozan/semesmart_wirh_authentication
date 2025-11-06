
import React, { useState } from 'react';
import { CloseIcon } from './common/Icons';

interface OnboardingGuideProps {
  onFinish: () => void;
}

type ScreenId = 'inicio' | 'gastos' | 'relatorios' | 'metas' | 'perfil';

const steps: { icon: string; title: string; description: string; tabId?: ScreenId }[] = [
  {
    icon: '👋',
    title: 'Bem-vindo(a) ao seu Controller Financeiro!',
    description: 'Vamos fazer um tour rápido para você conhecer as principais funcionalidades e começar a organizar as finanças da sua família.',
  },
  {
    icon: '📊',
    title: 'Painel Principal (Início)',
    description: 'Aqui você tem uma visão geral: saldo, gastos do mês e o progresso das suas metas. É o seu centro de comando financeiro.',
    tabId: 'inicio',
  },
  {
    icon: '💸',
    title: 'Adicione Transações',
    description: 'Use os botões de "Entrada" e "Gasto" para registrar todas as suas movimentações. Manter tudo atualizado é a chave!',
  },
  {
    icon: '🎯',
    title: 'Crie Metas e Sonhos',
    description: 'Na aba "Metas", você pode criar objetivos para a família, como uma viagem ou a compra de um bem. Acompanhem o progresso juntos!',
    tabId: 'metas',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Gerencie seu Perfil',
    description: 'Na aba "Perfil", você pode adicionar membros da família e cadastrar os cartões que vocês usam. Tudo pronto para começar!',
    tabId: 'perfil',
  },
];

const tabPositions: Record<ScreenId, string> = {
    inicio: '10%',
    gastos: '30%',
    relatorios: '50%',
    metas: '70%',
    perfil: '90%',
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };
  
  const arrowPosition = step.tabId ? tabPositions[step.tabId] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm text-center relative">
        <button onClick={onFinish} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" aria-label="Fechar tutorial">
            <CloseIcon />
        </button>

        <span className="text-5xl mb-4 inline-block">{step.icon}</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h2>
        <p className="text-gray-600 mb-6">{step.description}</p>
        
        <div className="flex items-center justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
                <div 
                    key={index} 
                    className={`w-2 h-2 rounded-full transition-colors ${index === currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
                />
            ))}
        </div>

        <button 
            onClick={handleNext}
            className="w-full py-3 bg-[#3B82F6] text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all"
        >
          {currentStep < steps.length - 1 ? 'Próximo' : 'Entendi, vamos lá!'}
        </button>

        {arrowPosition && (
            <div 
                className="absolute -bottom-16 text-blue-500 transition-all duration-300"
                style={{ left: arrowPosition, transform: 'translateX(-50%)' }}
            >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 20.5C12.8284 20.5 13.5 19.8284 13.5 19V6.20711L16.6464 9.35355C17.2322 9.93934 18.1819 9.93934 18.7678 9.35355C19.3536 8.76777 19.3536 7.81802 18.7678 7.23223L13.2678 1.73223C12.6819 1.14645 11.7322 1.14645 11.1464 1.73223L5.64645 7.23223C5.06066 7.81802 5.06066 8.76777 5.64645 9.35355C6.23223 9.93934 7.18198 9.93934 7.76777 9.35355L10.5 6.62132V19C10.5 19.8284 11.1716 20.5 12 20.5Z"/>
                </svg>
            </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingGuide;
