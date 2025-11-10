
import React from 'react';
import { EMOJI_LIST } from '../../constants/emojis';
import { CloseIcon } from '../common/Icons';

interface EmojiPickerModalProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Escolha um Emoji</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
        </div>
        <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
          {EMOJI_LIST.map(emoji => (
            <button
              key={emoji}
              onClick={() => { onSelect(emoji); onClose(); }}
              className="text-3xl p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmojiPickerModal;
