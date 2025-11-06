
import React, { useState, useEffect } from 'react';
import { Member, Card } from '../types';
import { EditIcon } from './common/Icons';
import EditMemberModal from './modals/EditMemberModal';

interface ProfileProps {
    currentUser: Member;
    members: Member[];
    cards: Card[];
    onAddMember: (data: Omit<Member, 'id'>) => void;
    onEditMember: (data: Member) => void;
    onAddCard: (data: Omit<Card, 'id'>) => void;
    onLogout: () => void;
    startWithAddMember?: boolean;
    onSetupComplete?: () => void;
}

const AddCardForm: React.FC<{ onAdd: ProfileProps['onAddCard'] }> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [last4, setLast4] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && last4.length === 4) {
            onAdd({ name, last4, issuer: 'other' }); // Simplified issuer
            setName('');
            setLast4('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome do cartão (ex: Nubank)" className="flex-grow px-3 py-2 border border-gray-300 rounded-md" required />
            <input type="number" value={last4} onChange={e => setLast4(e.target.value)} placeholder="Últimos 4 dígitos" className="w-1/3 px-2 py-2 border border-gray-300 rounded-md" required />
            <button type="submit" className="px-4 py-2 bg-[#52C293] text-white font-semibold rounded-md hover:bg-green-600">+</button>
        </form>
    );
};

const Profile: React.FC<ProfileProps> = ({ currentUser, members, cards, onAddMember, onEditMember, onAddCard, onLogout, startWithAddMember, onSetupComplete }) => {
    const [isMemberModalOpen, setMemberModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    useEffect(() => {
        if (startWithAddMember) {
            openAddModal();
            onSetupComplete?.();
        }
    }, [startWithAddMember, onSetupComplete]);

    const openAddModal = () => {
        setEditingMember(null);
        setMemberModalOpen(true);
    };

    const openEditModal = (member: Member) => {
        setEditingMember(member);
        setMemberModalOpen(true);
    };
    
    const handleSaveMember = (memberData: Member | Omit<Member, 'id'>) => {
        if ('id' in memberData) {
            onEditMember(memberData as Member);
        } else {
            onAddMember(memberData as Omit<Member, 'id'>);
        }
        setMemberModalOpen(false);
    };

    const canEdit = (member: Member): boolean => {
        if (!currentUser) return false;
        if (currentUser.role === 'Administrador') return true;
        if (currentUser.id === member.id) return true;
        if (currentUser.role === 'Cônjuge' && (member.title === 'Filho' || member.title === 'Filha')) return true;
        return false;
    };
    
    const isBase64Image = (str: string) => str.startsWith('data:image/');

    return (
        <>
            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Membros da Família 👨‍👩‍👧‍👦</h2>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <div className="space-y-3">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 overflow-hidden">
                                    {isBase64Image(member.avatar) ? (
                                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl">{member.avatar}</span>
                                    )}
                                    </div>
                                    <div className="flex-grow">
                                        <span className="font-semibold text-gray-700">{member.name}</span>
                                        <p className="text-xs text-gray-500">{member.title}</p>
                                    </div>
                                    {canEdit(member) && (
                                        <button onClick={() => openEditModal(member)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200">
                                            <EditIcon />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <button onClick={openAddModal} className="w-full px-4 py-2.5 bg-[#52C293] text-white font-semibold rounded-md hover:bg-green-600 transition-colors shadow">Adicionar Membro</button>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Cartões Cadastrados 💳</h2>
                    <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                        {cards.map(card => (
                            <div key={card.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="font-semibold text-gray-700">{card.name}</span>
                                <span className="text-sm text-gray-500">**** **** **** {card.last4}</span>
                            </div>
                        ))}
                        {cards.length === 0 && <p className="text-center text-gray-500 text-sm py-2">Nenhum cartão cadastrado.</p>}
                        <AddCardForm onAdd={onAddCard} />
                    </div>
                </section>
                
                <section className="pt-4">
                     <button 
                        onClick={onLogout} 
                        className="w-full px-4 py-2.5 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors shadow"
                     >
                        Sair (Logout)
                     </button>
                </section>
            </div>
            
            {isMemberModalOpen && (
                <EditMemberModal
                    member={editingMember}
                    currentUser={currentUser}
                    onClose={() => setMemberModalOpen(false)}
                    onSave={handleSaveMember}
                />
            )}
        </>
    );
};

export default Profile;
