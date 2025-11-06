
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebaseConfig';
import api from './api';
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
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    // auth can be null if firebase is not configured
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setDataLoading(true);
        try {
          const data = await api.getUserData(user.uid);
          setUserData(data);
          if (data && !data.hasSeenOnboarding) {
            setOnboardingOpen(true);
          }
        } catch (error) {
          console.error("Falha ao carregar dados do usuário:", error);
          await api.logout(); // Log out if data fetch fails
        } finally {
          setDataLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (!auth) {
    return <FirebaseNotConfigured />;
  }
  
  const handleLogout = async () => {
    await api.logout();
    // The onAuthStateChanged listener will handle state cleanup
  };

  // --- Data Handlers (now async and using Firebase API) ---
  const handleCreateGoal = async (newGoalData: Omit<Goal, 'id' | 'currentAmount'>) => {
    if (!userData || !currentUser) return;
    const newGoal: Goal = {
      ...newGoalData,
      id: `g${Date.now()}`,
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
    const newTransaction: Transaction = {
      ...newTxData,
      id: `t${Date.now()}`,
    };
    const updatedData = { ...userData, transactions: [newTransaction, ...userData.transactions] };
    const savedData = await api.updateUserData(currentUser.uid, updatedData);
    setUserData(savedData);
  };

  const handleAddMember = async (newMemberData: Omit<Member, 'id'>) => {
    if (!userData || !currentUser) return;
    const newMember: Member = {
      ...newMemberData,
      id: `m${Date.now()}`
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
      id: `c${Date.now()}`
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
  
  if (isAuthLoading || (currentUser && isDataLoading)) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-lg font-semibold animate-pulse">Carregando...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
  }
  
  if (!userData) {
      return (
          <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
              <p className="text-lg font-semibold">Erro ao carregar os dados. Tente novamente.</p>
          </div>
      );
  }
  
  const loggedInUserMember = userData.members[0];

  const renderScreen = () => {
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
          members={userData.members}
          type={transactionType}
        />
      }
      <div className="max-w-md mx-auto min-h-screen flex flex-col shadow-lg bg-white">
        <Header 
          familyProfile={userData.familyProfile} 
          onEditProfile={handleEditFamilyProfile}
          isAdmin={loggedInUserMember?.role === 'Administrador'}
        />
        <main className="flex-grow p-4 pb-24">
          {renderScreen()}
        </main>
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      </div>
    </div>
  );
};

export default App;
