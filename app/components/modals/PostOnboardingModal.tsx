import React from 'react';

interface PostOnboardingModalProps {
  onConfirm: () => void;
  onDecline: () => void;
}

const PostOnboardingModal: React.FC<PostOnboardingModalProps> = ({ onConfirm, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-sm text-center">
        <span className="text-5xl mb-4 inline-block">👨‍👩‍👧‍👦</span>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Tudo pronto!</h2>
        <p className="text-gray-600 mb-6">
          Que tal cadastrar os membros da sua família agora para começar a organizar as finanças de todos?
        </p>
        <div className="flex flex-col gap-3">
          <button 
              onClick={onConfirm}
              className="w-full py-3 bg-[#3B82F6] text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all"
          >
            Sim, vamos lá!
          </button>
          <button 
              onClick={onDecline}
              className="w-full py-2 text-sm text-gray-600 font-medium hover:text-gray-800"
          >
            Não, farei isso depois
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostOnboardingModal;
