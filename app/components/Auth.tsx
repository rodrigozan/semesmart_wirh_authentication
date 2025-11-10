import React, { useState } from 'react';
import api from '../api'; // Mantenha sua API existente para login/registro com email/senha
import { GoogleIcon } from './common/Icons';
import SocialLoginSimulationModal from './modals/SocialLoginSimulationModal';

// Importações do Firebase Auth
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, getAuth, AuthError } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Importe a instância de auth que você exportou

const familyTitles = ['Pai', 'Mãe', 'Filho', 'Filha', 'Avô', 'Avó', 'Tio', 'Tia', 'Outro'];

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Pai');
  const [error, setError] = useState('');
  // const [isSocialLoginModalOpen, setSocialLoginModalOpen] = useState(false); // Não precisará mais
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (isLogin) {
            await api.login(email, password);
        } else { // Register
            await api.register(name, title, email, password);
        }
        // onAuthStateChanged in App.tsx will handle the navigation
    } catch (err: any) {
        // Se for um erro do Firebase, use o tipo AuthError para melhor tratamento
        if (err.code) {
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('E-mail ou senha inválidos.');
                    break;
                case 'auth/email-already-in-use':
                    setError('Este e-mail já está cadastrado.');
                    break;
                case 'auth/weak-password':
                    setError('A senha deve ter pelo menos 6 caracteres.');
                    break;
                case 'auth/popup-closed-by-user':
                    setError('Login com Google cancelado pelo usuário.');
                    break;
                // Adicione outros códigos de erro do Firebase que você queira tratar
                default:
                    setError('Ocorreu um erro no Firebase: ' + err.message);
            }
        } else {
            setError(err.message || 'Ocorreu um erro.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  // NOVO: Função para login com Google
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Você pode usar signInWithPopup para um pop-up ou signInWithRedirect para redirecionamento
      // signInWithRedirect é geralmente melhor para navegadores que bloqueiam pop-ups e para mobile
      await signInWithRedirect(auth, provider);
      // Redirecionamentos são tratados pelo Firebase globalmente, então o código abaixo não será executado imediatamente
      // O seu listener onAuthStateChanged (se estiver em App.tsx) será acionado após o redirecionamento.
    } catch (err: any) {
        // Trate erros específicos do Firebase Auth
        if (err && (err as any).code) {
            switch ((err as any).code) {
                case 'auth/popup-closed-by-user':
                    setError('Login com Google cancelado.');
                    break;
                case 'auth/cancelled-popup-request':
                    setError('Outro pedido de pop-up já está em andamento.');
                    break;
                case 'auth/operation-not-allowed':
                    setError('Login com Google não está habilitado. Verifique as configurações do Firebase.');
                    break;
                case 'auth/account-exists-with-different-credential':
                    setError('Já existe uma conta com este e-mail usando outro método de login.');
                    break;
                default:
                    setError(`Erro ao fazer login com Google: ${err.message}`);
            }
        } else {
            setError('Ocorreu um erro inesperado ao tentar login com Google.');
        }
        console.error("Erro Google Sign-In:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remover a função handleSocialLoginSubmit e o SocialLoginSimulationModal

  return (
    <>
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center p-1 shadow-lg">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                  <path d="M14.25 8.75C14.25 5.5625 11.6875 3 8.5 3C5.3125 3 2.75 5.5625 2.75 8.75C2.75 11.75 5.0625 14.125 7.9375 14.25C8.125 17.5 9.0625 21 12 21C14.9375 21 15.875 17.5 16.0625 14.25C18.9375 14.125 21.25 11.75 21.25 8.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 21C12 19.375 12.4375 16.25 14.25 14.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
                SemeSmart
              </h1>
            </div>
            <p className="text-gray-500 mt-4">Semear o futuro financeiro da sua família.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
                <>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Seu Nome</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Seu Título na Família</label>
                      <select id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                          {familyTitles.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                </>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Senha</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-400 to-blue-500 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Registrar e Entrar')}
              </button>
            </div>
          </form>

          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OU</span>
              </div>
            </div>
          </div>

          <div>
              <button
                  type="button"
                  onClick={handleGoogleSignIn} // Chama a nova função do Firebase
                  disabled={isLoading}
                  className="w-full inline-flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                  <GoogleIcon />
                  Continue com o Google
              </button>
          </div>

          <div className="mt-6 text-center">
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-blue-600 hover:text-blue-500">
                  {isLogin ? 'Não tem uma conta? Crie uma agora!' : 'Já tem uma conta? Faça o login.'}
              </button>
          </div>
        </div>
      </div>

      {/* Você pode remover o SocialLoginSimulationModal, pois não é mais necessário */}
      {/* {isSocialLoginModalOpen && (
        <SocialLoginSimulationModal
          onClose={() => setSocialLoginModalOpen(false)}
          onSubmit={handleSocialLoginSubmit}
        />
      )} */}
    </>
  );
};

export default Auth;
