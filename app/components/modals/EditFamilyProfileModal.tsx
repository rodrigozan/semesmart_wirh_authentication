
import React, { useState, useRef } from 'react';
import { FamilyProfile } from '../../types';
import { CloseIcon } from '../common/Icons';
import EmojiPickerModal from './EmojiPickerModal';

interface EditFamilyProfileModalProps {
  profile: FamilyProfile;
  onClose: () => void;
  onSave: (updatedProfile: FamilyProfile) => void;
}

const EditFamilyProfileModal: React.FC<EditFamilyProfileModalProps> = ({ profile, onClose, onSave }) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, avatar });
    onClose();
  };

  const isImage = avatar.startsWith('data:image/');

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Editar Perfil da Família</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden hover:bg-gray-300 transition-colors ring-2 ring-offset-2 ring-blue-500">
                {isImage ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{avatar}</span>
                )}
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEmojiPickerOpen(true)} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300">Trocar Emoji</button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300">Upload/Foto</button>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" capture="user" className="hidden" />
              </div>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome da Família</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-700">Salvar</button>
            </div>
          </form>
        </div>
      </div>
      {isEmojiPickerOpen && <EmojiPickerModal onClose={() => setEmojiPickerOpen(false)} onSelect={setAvatar} />}
    </>
  );
};

export default EditFamilyProfileModal;
