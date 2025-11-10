
import React, { useState } from 'react';
import { FamilyProfile } from '../../types';
import { EditIcon } from './Icons';
import EditFamilyProfileModal from '../modals/EditFamilyProfileModal';

interface HeaderProps {
  familyProfile: FamilyProfile;
  onEditProfile: (profile: FamilyProfile) => void;
  isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({ familyProfile, onEditProfile, isAdmin }) => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const isBase64Image = (str: string) => str.startsWith('data:image/');

  return (
    <>
      <header className="p-4 bg-white border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{familyProfile.name}</h1>
            <p className="text-sm text-gray-500">Semear o futuro financeiro da sua família.</p>
          </div>
          <div className="relative">
            <button 
              onClick={isAdmin ? () => setEditModalOpen(true) : undefined}
              className={`w-12 h-12 rounded-full flex items-center justify-center bg-blue-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
              aria-label={isAdmin ? "Editar perfil da família" : familyProfile.name}
              disabled={!isAdmin}
            >
                {isBase64Image(familyProfile.avatar) ? (
                  <img src={familyProfile.avatar} alt={familyProfile.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-2xl">{familyProfile.avatar}</span>
                )}
            </button>
          </div>
        </div>
      </header>
      {isEditModalOpen && (
        <EditFamilyProfileModal 
          profile={familyProfile}
          onClose={() => setEditModalOpen(false)}
          onSave={onEditProfile}
        />
      )}
    </>
  );
};

export default Header;