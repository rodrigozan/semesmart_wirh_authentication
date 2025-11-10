import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User, getRedirectResult, GoogleAuthProvider } from 'firebase/auth'; // Importamos getRedirectResult e GoogleAuthProvider
import { auth } from './firebaseConfig'; // Sua instância de auth
import api from './api'; // Assumimos que 'api' lida com operações de Firestore/dados do usuário
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Goals from './components/Goals';
import Profile from './components/Profile';
import OnboardingGuide from './components/OnboardingGuide';
import CreateTransactionModal from './components/modals/CreateTransactionModal';
import Auth from './components/Auth';
import PostOnboardingModal from './components/modals/PostOnboardingModal';
import { Goal, Challenge, Transaction, Member, Card, FamilyProfile, UserData } from './types';
import { defaultUserData } from "./constants/defaults";

type Screen = 'inicio' | 'gastos' | 'relatorios' | 'metas' | 'perfil';

const FirebaseNotConfigured: React.FC = () => (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-red-200">
        <div className="text-6xl mb-4">🔥</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">Configuração Incompleta</h1>
        <p className="text-gray-700 mb-2">
          Parece que as credenciais do Firebase não foram configuradas corretamente.
        </p>
        <p className="text-gray-600 mb-6">
          Para que o SemeSmart funcione, por favor, abra o arquivo <code className="bg-gray-200 text-sm font-mono p-1 rounded">firebaseConfig.ts</code> e substitua os valores de placeholder pelas suas próprias chaves do seu projeto Firebase.
        </p>
        <a 
          href="https://console.firebase.google.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-block bg-amber-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-600 transition-colors shadow-md"
        >
          Abrir Console do Firebase
        </a>
      </div>
    </div>
  );

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('inicio');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAuthLoading, setAuthLoading] = useState(true);
  const [isDataLoading, setDataLoading] = useState(false);
  
  // --- Modal State ---
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [isOnboardingOpen, setOnboardingOpen] = useState(false);
  const [isPostOnboardingModalOpen, setPostOnboardingModalOpen] = useState(false);
  const [startMemberSetup, setStartMemberSetup] = useState(false);
  
  // Função centralizada para buscar dados do usuário (useCallback para otimização)
  const fetchUserData = useCallback(async (user: User) => {
    setDataLoading(true);
    try {
      const data = await api.getUserData(user.uid);
      console.log("Dados do usuário carregados:", data);
      setUserData(data);
      if (data && !data.hasSeenOnboarding) {
        setOnboardingOpen(true);
      }
      // Após um login bem-sucedido (incluindo via redirecionamento) ou carregamento de dados,
      // definimos a tela ativa para o dashboard.
      setActiveScreen('inicio'); 
    } catch (error) {
      console.error("Falha ao carregar dados do usuário:", error);
      setUserData(null); // Define userData como null para indicar erro no carregamento
    } finally {
      setDataLoading(false);
    }
  }, []); // Sem dependências para que a função seja estável

  // Escuta por mudanças no estado de autenticação do Firebase
  useEffect(() => {
  if (!auth) {
    setAuthLoading(false);
    return;
  }

  const initAuth = async () => {
    try {
      // 1️⃣ Primeiro: processa o resultado do redirect
      const result = await getRedirectResult(auth);
      if (result?.user) {
        console.log("✅ Login Google via redirect:", result.user.email);
        setCurrentUser(result.user);
        await fetchUserData(result.user);
        return; // evita registrar listener duplicado
      }
    } catch (error: any) {
      console.error("Erro ao obter redirect result:", error.code, error.message);
    }

    // 2️⃣ Depois: registra o listener de mudanças de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("✅ Usuário autenticado:", user.email);
        setCurrentUser(user);

        // 1️⃣ Tenta carregar o documento no Firestore
        const existingData = await api.getUserData(user.uid);

        // 2️⃣ Se for um novo login (ou seja, doc ainda não existe), cria o perfil base
        if (!existingData) {
          const newUserData: UserData = {
            ...defaultUserData,
            members: [{ id: "m1", name: user.displayName || "Eu", avatar: "😊", role: "Administrador", title: "Admin" }],
            familyProfile: {
              name: user.displayName || "Minha Família",
              createdAt: new Date().toISOString(),
            },
          };
          await api.updateUserData(user.uid, newUserData);
          setUserData(newUserData);
          console.log("🆕 Novo usuário criado no Firestore:", user.uid);
        } else {
          setUserData(existingData);
        }

        setActiveScreen("inicio");
      } else {
        console.log("⚠️ Nenhum usuário autenticado");
        setCurrentUser(null);
        setUserData(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  };

  initAuth();
}, [fetchUserData]);


  if (!auth) {
    return <FirebaseNotConfigured />;
  }
  
  const handleLogout = async () => {
    await api.logout();
    // O listener onAuthStateChanged cuidará da limpeza do estado e do redirecionamento para Auth
  };

  // --- Data Handlers ---
  // Seus manipuladores de dados permanecem em grande parte os mesmos,
  // mas é uma boa prática garantir que `userData` e `currentUser` não sejam nulos
  // antes de tentar manipulá-los.

  const handleCreateGoal = async (newGoalData: Omit<Goal, 'id' | 'currentAmount'>) => {
    if (!userData || !currentUser) return; // Proteção contra estado nulo
    const newGoal: Goal = {
      ...newGoalData,
      id: `g${Date.now()}`, // Considere usar o ID do documento do Firebase para IDs reais do banco de dados
      currentAmount: 0,
    };
    const updatedData = { ...userData, goals: [...userData.goals, newGoal] };
    const savedData = await api.updateUserData(currentUser.uid, updatedData);
    setUserData(savedData);
  };
  
  const handleEditGoal = async (updatedGoal: Goal) => {
    if (!userData || !currentUser) return;
    const updatedData = { ...userData, goals: userData.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g) };
    const savedData = await api.updateUserData(currentUser.uid, updatedData);
    setUserData(savedData);
  };

  const handleAddTransaction = async (newTxData: Omit<Transaction, 'id'>) => {
    if (!userData || !currentUser) return;

    try {
      const amount = Number(newTxData.amount);
      if (isNaN(amount)) throw new Error("Valor inválido");

      const newTransaction: Transaction = {
        ...newTxData,
        id: `t${Date.now()}`,
        amount: newTxData.type === "expense" ? -Math.abs(amount) : Math.abs(amount), // garante sinal correto
        date: newTxData.date || new Date().toISOString(),
      };

      const updatedData = {
        ...userData,
        transactions: [newTransaction, ...(userData.transactions || [])],
      };

      const savedData = await api.updateUserData(currentUser.uid, updatedData);
      setUserData(savedData);

      console.log("✅ Transação adicionada:", newTransaction);
    } catch (error) {
      console.error("🔥 Erro ao adicionar transação:", error);
      alert("Erro ao adicionar transação. Verifique os dados.");
    }
  };


  const handleAddMember = async (newMemberData: Omit<Member, 'id'>) => {
    if (!userData || !currentUser) return;
    const newMember: Member = {
      ...newMemberData,
      id: `m${Date.now()}` // Considere usar o ID do documento do Firebase para IDs reais do banco de dados
    };
    const updatedData = { ...userData, members: [...userData.members, newMember] };
    const savedData = await api.updateUserData(currentUser.uid, updatedData);
    setUserData(savedData);
  };

  const handleEditMember = async (updatedMember: Member) => {
    if (!userData || !currentUser) return;
    const updatedData = { ...userData, members: userData.members.map(m => m.id === updatedMember.id ? updatedMember : m) };
    const savedData = await api.updateUserData(currentUser.uid, updatedData);
    setUserData(savedData);
  };
  
  const handleEditFamilyProfile = async (updatedProfile: FamilyProfile) => {
    if (!userData || !currentUser) return;
    const updatedData = { ...userData, familyProfile: updatedProfile };
    const savedData = await api.updateUserData(currentUser.uid, updatedData);
    setUserData(savedData);
  };

  const handleAddCard = async (newCardData: Omit<Card, 'id'>) => {
    if (!userData || !currentUser) return;
    const newCard: Card = {
      ...newCardData,
      id: `c${Date.now()}` // Considere usar o ID do documento do Firebase para IDs reais do banco de dados
    };
    const updatedData = { ...userData, cards: [...userData.cards, newCard] };
    const savedData = await api.updateUserData(currentUser.uid, updatedData);
    setUserData(savedData);
  };

  const handleUpdateChallengeStatus = async (challengeId: string, status: Challenge['status']) => {
    if (!userData || !currentUser) return;
    const updatedData = { ...userData, challenges: userData.challenges.map(c => c.id === challengeId ? { ...c, status } : c) };
    const savedData = await api.updateUserData(currentUser.uid, updatedData);
    setUserData(savedData);
  };
  
  const openTransactionModal = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setTransactionModalOpen(true);
  };
  
  const handleOnboardingFinish = () => {
    setOnboardingOpen(false);
    setPostOnboardingModalOpen(true);
  };
  
  const updateOnboardingFlag = async () => {
    if (!userData || !currentUser) return;
    if (!userData.hasSeenOnboarding) {
        const updatedData = { ...userData, hasSeenOnboarding: true };
        const savedData = await api.updateUserData(currentUser.uid, updatedData);
        setUserData(savedData);
    }
  }
  
  const handleStartFamilySetup = () => {
    setActiveScreen('perfil');
    setStartMemberSetup(true);
    setPostOnboardingModalOpen(false);
    updateOnboardingFlag();
  };
  
  const handleDeclineFamilySetup = () => {
    setPostOnboardingModalOpen(false);
    updateOnboardingFlag();
  };
  
  // Renderiza um carregador enquanto a autenticação ou dados do usuário estão sendo carregados
  if (isAuthLoading || (currentUser && isDataLoading)) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-lg font-semibold animate-pulse">Carregando...</p>
      </div>
    );
  }

  // Se não há um usuário logado após a verificação, exibe a tela de autenticação
  if (!currentUser) {
    return <Auth />;
  }
  
  // Se há um usuário logado, mas os dados do usuário não puderam ser carregados
  if (!userData && !isDataLoading) { 
      return (
          <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
              <p className="text-lg font-semibold">Erro ao carregar os dados. Tente novamente.</p>
              {/* Opcionalmente, adicione um botão para tentar novamente */}
          </div>
      );
  }
  
  // Membro do usuário logado (assumindo que o primeiro membro seja o principal)
  // Usamos optional chaining para evitar erros se userData ou members for null/undefined
  const loggedInUserMember = userData?.members?.[0];

  // Função para renderizar a tela ativa
  const renderScreen = () => {
    // Se userData ainda é nulo aqui, significa que está em um estado intermediário
    // ou houve um erro, então podemos mostrar um carregador ou uma mensagem de erro
    if (!userData) { 
        return (
            <div className="flex items-center justify-center h-full">
                <p>Preparando dados do usuário...</p> 
            </div>
        );
    }
    switch (activeScreen) {
      case 'inicio':
        return <Dashboard 
                  transactions={userData.transactions} 
                  members={userData.members} 
                  goals={userData.goals} 
                  challenges={userData.challenges}
                  onUpdateChallengeStatus={handleUpdateChallengeStatus}
                  onAddTransaction={openTransactionModal}
                />;
      case 'gastos':
        return <Transactions transactions={userData.transactions} members={userData.members} />;
      case 'relatorios':
        return <Reports transactions={userData.transactions} />;
      case 'metas':
        return <Goals goals={userData.goals} onCreateGoal={handleCreateGoal} onEditGoal={handleEditGoal} />;
      case 'perfil':
        return <Profile 
                  currentUser={loggedInUserMember}
                  members={userData.members} 
                  cards={userData.cards} 
                  onAddMember={handleAddMember} 
                  onEditMember={handleEditMember}
                  onAddCard={handleAddCard} 
                  onLogout={handleLogout}
                  startWithAddMember={startMemberSetup}
                  onSetupComplete={() => setStartMemberSetup(false)}
                />;
      default:
        // Caso padrão, pode ser o Dashboard
        return <Dashboard 
                  transactions={userData.transactions} 
                  members={userData.members} 
                  goals={userData.goals} 
                  challenges={userData.challenges}
                  onUpdateChallengeStatus={handleUpdateChallengeStatus}
                  onAddTransaction={openTransactionModal}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-gray-800">
      {/* Modais são renderizados condicionalmente */}
      {isOnboardingOpen && <OnboardingGuide onFinish={handleOnboardingFinish} />}
      {isPostOnboardingModalOpen && (
        <PostOnboardingModal 
          onConfirm={handleStartFamilySetup}
          onDecline={handleDeclineFamilySetup}
        />
      )}
      {isTransactionModalOpen && 
        <CreateTransactionModal 
          onClose={() => setTransactionModalOpen(false)} 
          onSubmit={handleAddTransaction}
          members={userData?.members || []} // Fornece um array vazio como padrão se userData.members for null/undefined
          type={transactionType}
        />
      }
      {/* Layout principal do aplicativo */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col shadow-lg bg-white">
        {/* Renderiza Header e BottomNav apenas se os dados do usuário estiverem carregados */}
        {userData && (
            <Header 
              familyProfile={userData.familyProfile} 
              onEditProfile={handleEditFamilyProfile}
              isAdmin={loggedInUserMember?.role === 'Administrador'}
            />
        )}
        <main className="flex-grow p-4 pb-24">
          {renderScreen()}
        </main>
        {userData && (
            <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
        )}
      </div>
    </div>
  );
};

export default App;
