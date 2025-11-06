import React, { useMemo } from 'react';
import { Transaction, Member, Goal, Category, Challenge } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from './common/Icons';
import EmptyState from './common/EmptyState';


interface DashboardProps {
  transactions: Transaction[];
  members: Member[];
  goals: Goal[];
  challenges: Challenge[];
  onUpdateChallengeStatus: (challengeId: string, status: Challenge['status']) => void;
  onAddTransaction: (type: 'income' | 'expense') => void;
}

const categoryColors: { [key in Category]?: string } = {
  [Category.Mercado]: '#FBBF24',
  [Category.Transporte]: '#60A5FA',
  [Category.Lazer]: '#EC4899',
  [Category.Educacao]: '#A78BFA',
  [Category.Contas]: '#F87171',
  [Category.Saude]: '#34D399',
  [Category.Dizimo]: '#2DD4BF',
  [Category.Outros]: '#9CA3AF',
};

const ChallengeCard: React.FC<{ challenge: Challenge; onUpdate: DashboardProps['onUpdateChallengeStatus'] }> = ({ challenge, onUpdate }) => {
  const getButton = () => {
    switch (challenge.status) {
      case 'available':
        return <button onClick={() => onUpdate(challenge.id, 'active')} className="bg-[#52C293] text-white text-xs font-bold py-1.5 px-3 rounded-full hover:bg-green-600 transition-colors whitespace-nowrap">Aceitar</button>;
      case 'active':
        return <button onClick={() => onUpdate(challenge.id, 'completed')} className="bg-[#3B82F6] text-white text-xs font-bold py-1.5 px-3 rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap">Concluir</button>;
      case 'completed':
        return <span className="text-sm font-semibold text-amber-600">Concluído! 🏅</span>;
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between gap-3">
        <div className="text-2xl bg-gray-100 w-10 h-10 flex items-center justify-center rounded-lg">{challenge.icon}</div>
        <div className="flex-grow">
            <p className="font-semibold text-gray-700">{challenge.title}</p>
            <p className="text-xs text-gray-500">{challenge.description}</p>
        </div>
        {getButton()}
    </div>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ transactions, goals, challenges, onUpdateChallengeStatus, onAddTransaction }) => {

  const { totalIncomes, totalExpenses, balance } = useMemo(() => {
    let totalIncomes = 0;
    let totalExpenses = 0;
    transactions.forEach(t => {
      if (t.amount > 0) totalIncomes += t.amount;
      else totalExpenses += t.amount;
    });
    return { totalIncomes, totalExpenses, balance: totalIncomes + totalExpenses };
  }, [transactions]);

  const expensesByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    transactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += Math.abs(t.amount);
      });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const firstGoal = goals.length > 0 ? goals[0] : null;
  const savingsProgress = firstGoal ? (firstGoal.currentAmount / firstGoal.targetAmount) * 100 : 0;
  
  if (transactions.length === 0) {
      return (
          <div className="flex flex-col h-full justify-center">
              <EmptyState
                  icon="💸"
                  title="Nenhuma transação ainda"
                  description="Adicione sua primeira entrada ou gasto para começar a organizar suas finanças."
              />
              <div className="grid grid-cols-2 gap-4 text-center mt-8">
                  <button onClick={() => onAddTransaction('income')} className="flex items-center justify-center gap-2 py-3 bg-[#52C293] text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition-colors">
                      <ArrowUpIcon /> Adicionar Entrada
                  </button>
                  <button onClick={() => onAddTransaction('expense')} className="flex items-center justify-center gap-2 py-3 bg-red-400 text-white font-semibold rounded-xl shadow-md hover:bg-red-500 transition-colors">
                      <ArrowDownIcon /> Adicionar Gasto
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-4 rounded-xl">
          <p className="text-sm text-emerald-700">Saldo da família</p>
          <p className="text-2xl font-bold text-emerald-900">
            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl">
          <p className="text-sm text-red-700">Gastos este mês</p>
          <p className="text-2xl font-bold text-red-900">
            {Math.abs(totalExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </div>

       {firstGoal && (
         <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm font-medium text-blue-700">Próxima meta</p>
                    <p className="text-xs text-blue-600">💡 {firstGoal.name}</p>
                </div>
                <p className="font-bold text-blue-800">{savingsProgress.toFixed(0)}%</p>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2.5 mt-2">
              <div className="bg-[#3B82F6] h-2.5 rounded-full" style={{ width: `${savingsProgress}%` }}></div>
            </div>
          </div>
       )}
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">Gastos por Categoria</h2>
        <div className="w-full h-56 bg-white p-2 rounded-xl">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expensesByCategory.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={80} />
                <Tooltip cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Total']} />
                <Bar dataKey="value" barSize={20} radius={[0, 10, 10, 0]}>
                    {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.name as Category] || '#8884d8'} />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">Desafios do Mês 💪</h2>
        <div className="space-y-3">
            {challenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} onUpdate={onUpdateChallengeStatus} />
            ))}
        </div>
      </div>

       <div className="grid grid-cols-2 gap-4 text-center pt-2">
            <button onClick={() => onAddTransaction('income')} className="flex items-center justify-center gap-2 py-3 bg-[#52C293] text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition-colors">
                <ArrowUpIcon /> Entrada
            </button>
            <button onClick={() => onAddTransaction('expense')} className="flex items-center justify-center gap-2 py-3 bg-red-400 text-white font-semibold rounded-xl shadow-md hover:bg-red-500 transition-colors">
                <ArrowDownIcon /> Gasto
            </button>
        </div>
    </div>
  );
};

export default Dashboard;