import React, { useState, useEffect } from 'react';
import Papa from "papaparse";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
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
      onAdd({ name, last4, issuer: 'other' });
      setName('');
      setLast4('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome do cartão (ex: Nubank)"
        className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
        required
      />
      <input
        type="number"
        value={last4}
        onChange={(e) => setLast4(e.target.value)}
        placeholder="Últimos 4 dígitos"
        className="w-1/3 px-2 py-2 border border-gray-300 rounded-md"
        required
      />
      <button
        type="submit"
        className="px-4 py-2 bg-[#52C293] text-white font-semibold rounded-md hover:bg-green-600"
      >
        +
      </button>
    </form>
  );
};

const Profile: React.FC<ProfileProps> = ({
  currentUser,
  members,
  cards,
  onAddMember,
  onEditMember,
  onAddCard,
  onLogout,
  startWithAddMember,
  onSetupComplete,
}) => {
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

  // ============================================================
  // 📤 UPLOAD DE PLANEJAMENTO MENSAL (CSV)
  // ============================================================
  const handleUploadPlanningCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true, delimiter: ";" });
      const data = parsed.data as any[];

      const currentDate = new Date();
      const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

      const docRef = doc(db, "users", currentUser.id, "planos_mensais", key);
      await setDoc(docRef, {
        mes: key,
        criadoEm: new Date().toISOString(),
        planejamento: data,
      });

      alert("📊 Planejamento mensal carregado com sucesso!");
    } catch (error) {
      console.error("Erro ao importar o CSV:", error);
      alert("❌ Erro ao importar o arquivo. Verifique o formato.");
    }
  };

  // ============================================================
  // 📈 FUNÇÃO DE COMPARAÇÃO PLANEJADO VS REALIZADO
  // ============================================================
  const compararPlanejadoRealizado = (planejado: any[], transacoes: any[]) => {
    const resultado: {
      categoria: string;
      planejado: number;
      realizado: number;
      diferenca: number;
    }[] = [];

    const categorias = [
      ...new Set([
        ...planejado.map((p) => p.Categoria),
        ...transacoes.map((t) => t.categoria),
      ]),
    ];

    for (const cat of categorias) {
      const totalPlanejado = planejado
        .filter((p) => p.Categoria === cat)
        .reduce((acc, cur) => acc + parseFloat(cur["Valor (R$)"] || 0), 0);

      const totalRealizado = transacoes
        .filter((t) => t.categoria === cat)
        .reduce((acc, cur) => acc + (cur.valor || 0), 0);

      resultado.push({
        categoria: cat,
        planejado: totalPlanejado,
        realizado: totalRealizado,
        diferenca: totalRealizado - totalPlanejado,
      });
    }

    console.table(resultado);
    return resultado;
  };

  return (
    <>
      <div className="space-y-8">
        {/* ===================================================== */}
        {/* SEÇÃO DE MEMBROS */}
        {/* ===================================================== */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Membros da Família 👨‍👩‍👧‍👦
          </h2>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 overflow-hidden">
                    {isBase64Image(member.avatar) ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">{member.avatar}</span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <span className="font-semibold text-gray-700">
                      {member.name}
                    </span>
                    <p className="text-xs text-gray-500">{member.title}</p>
                    {member.email && (
                      <p className="text-xs text-gray-400">{member.email}</p>
                    )}
                  </div>
                  {canEdit(member) && (
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200"
                    >
                      <EditIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={openAddModal}
                className="w-full px-4 py-2.5 bg-[#52C293] text-white font-semibold rounded-md hover:bg-green-600 transition-colors shadow"
              >
                Adicionar Membro
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* SEÇÃO DE CARTÕES */}
        {/* ===================================================== */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Cartões Cadastrados 💳
          </h2>
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <span className="font-semibold text-gray-700">{card.name}</span>
                <span className="text-sm text-gray-500">
                  **** **** **** {card.last4}
                </span>
              </div>
            ))}
            {cards.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-2">
                Nenhum cartão cadastrado.
              </p>
            )}
            <AddCardForm onAdd={onAddCard} />
          </div>
        </section>

        {/* ===================================================== */}
        {/* UPLOAD DO PLANEJAMENTO MENSAL */}
        {/* ===================================================== */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Planejamento Mensal 📅
          </h2>
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-gray-600 text-sm">
              Importe o arquivo CSV do seu planejamento mensal.
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleUploadPlanningCSV}
              className="hidden"
              id="upload-plano"
            />
            <label
              htmlFor="upload-plano"
              className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition"
            >
              📤 Importar Planejamento
            </label>
          </div>
        </section>

        {/* ===================================================== */}
        {/* BOTÃO DE LOGOUT */}
        {/* ===================================================== */}
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
