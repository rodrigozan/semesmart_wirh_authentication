
import React, { useState, useRef } from 'react';
import { Member, MemberRole } from '../../types';
import { CloseIcon } from '../common/Icons';
import EmojiPickerModal from './EmojiPickerModal';

interface EditMemberModalProps {
  member: Member | null; // null for adding new member
  currentUser: Member;
  onClose: () => void;
  onSave: (data: Member | Omit<Member, 'id'>) => void;
}

const familyTitles = ['Pai', 'Mãe', 'Filho', 'Filha', 'Avô', 'Avó', 'Tio', 'Tia', 'Primo', 'Prima', 'Outro'];
const memberRoles: MemberRole[] = ['Administrador', 'Cônjuge', 'Membro'];

const EditMemberModal: React.FC<EditMemberModalProps> = ({ member, currentUser, onClose, onSave }) => {
    const [name, setName] = useState(member?.name || '');
    const [avatar, setAvatar] = useState(member?.avatar || '😊');
    const [title, setTitle] = useState(member?.title || 'Filho');
    const [role, setRole] = useState<MemberRole>(member?.role || 'Membro');
    const [incomeSource, setIncomeSource] = useState(member?.incomeSource || '');
    
    const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = member !== null;

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
        if (name && avatar && title && role) {
            const memberData = { name, avatar, title, role, incomeSource };
            if (isEditing) {
                onSave({ id: member.id, ...memberData });
            } else {
                onSave(memberData);
            }
        }
    };

    const isImage = avatar.startsWith('data:image/');
    const isAdmin = currentUser.role === 'Administrador';

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Editar Membro' : 'Adicionar Membro'}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col items-center gap-4">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden hover:bg-gray-300 transition-colors ring-2 ring-offset-2 ring-blue-500">
                                {isImage ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-5xl">{avatar}</span>}
                            </button>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setEmojiPickerOpen(true)} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300">Emoji</button>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300">Upload</button>
                                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" capture="user" className="hidden" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título na Família</label>
                            <select id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                {familyTitles.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="incomeSource" className="block text-sm font-medium text-gray-700">Fonte de Renda Principal (Opcional)</label>
                            <input type="text" id="incomeSource" placeholder="Ex: Salário, Pensão" value={incomeSource} onChange={e => setIncomeSource(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                         <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Permissão</label>
                            <select id="role" value={role} onChange={e => setRole(e.target.value as MemberRole)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" disabled={!isAdmin}>
                                {memberRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                             {!isAdmin && <p className="text-xs text-gray-500 mt-1">Apenas administradores podem alterar permissões.</p>}
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

export default EditMemberModal;
