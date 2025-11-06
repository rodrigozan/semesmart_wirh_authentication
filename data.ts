import { UserData, Challenge } from './types';

export const challenges: Challenge[] = [
    { id: 'c1', title: 'Semana sem delivery', description: 'Cozinhe em casa e economize.', icon: '🧑‍🍳', status: 'available' },
    { id: 'c2', title: 'Reduzir lazer em 15%', description: 'Corte R$150 dos gastos com lazer este mês.', icon: '📉', status: 'active' },
    { id: 'c3', title: 'Dia de compras consciente', description: 'Vá ao mercado com uma lista e siga-a.', icon: '🛒', status: 'completed' },
];

export const defaultUserData: UserData = {
  familyProfile: { name: 'Minha Família', avatar: '👨‍👩‍👧‍👦' },
  transactions: [],
  members: [{ id: 'm1', name: 'Eu', avatar: '😊', role: 'Administrador', title: 'Admin' }],
  goals: [],
  challenges: challenges,
  cards: [],
  hasSeenOnboarding: false,
};
