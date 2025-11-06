export enum Category {
  Mercado = 'Mercado',
  Transporte = 'Transporte',
  Lazer = 'Lazer',
  Educacao = 'Educação',
  Contas = 'Contas',
  Saude = 'Saúde',
  Dizimo = 'Dízimo',
  Outros = 'Outros',
  Entrada = 'Entrada',
}

export enum PaymentMethod {
  Debito = 'Cartão de Débito',
  CreditoAVista = 'Crédito à Vista',
  CreditoParcelado = 'Crédito Parcelado',
  Dinheiro = 'Dinheiro',
  Beneficio = 'Cartão Benefício',
  PIX = 'PIX',
}

export type MemberRole = 'Administrador' | 'Cônjuge' | 'Membro';

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: MemberRole;
  title: string;
  incomeSource?: string;
}

export interface FamilyProfile {
  name: string;
  avatar: string;
}

export interface Transaction {
  id:string;
  description: string;
  amount: number;
  date: string;
  category: Category;
  memberId: string;
  paymentMethod?: PaymentMethod;
  location?: string;
  incomeSource?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  illustration: string;
  deadline?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'available' | 'active' | 'completed';
}

export interface Card {
  id: string;
  name: string;
  last4: string;
  issuer: 'visa' | 'mastercard' | 'elo' | 'amex' | 'other';
}
// Fix: Added UserData interface to be used in App.tsx.
export interface UserData {
  familyProfile: FamilyProfile;
  transactions: Transaction[];
  members: Member[];
  goals: Goal[];
  challenges: Challenge[];
  cards: Card[];
  hasSeenOnboarding: boolean;
}

// Fix: Added UserCredentials interface to be used in Auth.tsx.
export interface UserCredentials {
  [key: string]: string;
}
