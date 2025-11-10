import React, { useState, useMemo } from 'react';
import { Transaction, Member, Category } from '../types';
import EmptyState from './common/EmptyState';


interface TransactionsProps {
  transactions: Transaction[];
  members: Member[];
}

const categoryDetails: { [key in Category]: { icon: string; color: string } } = {
  [Category.Mercado]: { icon: '🛒', color: 'bg-amber-100 text-amber-800' },
  [Category.Transporte]: { icon: '🚗', color: 'bg-blue-100 text-blue-800' },
  [Category.Lazer]: { icon: '🎉', color: 'bg-pink-100 text-pink-800' },
  [Category.Educacao]: { icon: '🎓', color: 'bg-violet-100 text-violet-800' },
  [Category.Contas]: { icon: '🧾', color: 'bg-red-100 text-red-800' },
  [Category.Saude]: { icon: '❤️‍🩹', color: 'bg-emerald-100 text-emerald-800' },
  [Category.Dizimo]: { icon: '🙏', color: 'bg-teal-100 text-teal-800' },
  [Category.Outros]: { icon: '📦', color: 'bg-gray-100 text-gray-800' },
  [Category.Entrada]: { icon: '💰', color: 'bg-green-100 text-green-800' },
};

const TransactionItem: React.FC<{ transaction: Transaction; member?: Member }> = ({ transaction, member }) => {
  const isExpense = transaction.amount < 0;
  const details = categoryDetails[transaction.category];

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${details.color}`}>
          {details.icon}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{transaction.description}</p>
          <p className="text-sm text-gray-500">
            {isExpense && transaction.location ? <span className="font-medium">{`${transaction.location} - `}</span> : ''}
            {!isExpense && transaction.incomeSource ? <span className="font-medium">{`${transaction.incomeSource} - `}</span> : ''}
            {member?.name || 'Família'} - {new Date(transaction.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
            {isExpense && transaction.paymentMethod ? ` - ${transaction.paymentMethod}` : ''}
          </p>
        </div>
      </div>
      <p className={`font-bold text-lg ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
        {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>
    </div>
  );
};

const Transactions: React.FC<TransactionsProps> = ({ transactions, members }) => {
  const [activeFilter, setActiveFilter] = useState<string>('todos');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => activeFilter === 'todos' || t.memberId === activeFilter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, activeFilter]);

  if (transactions.length === 0) {
    return (
        <EmptyState
            icon="🧾"
            title="Sua lista de transações está vazia"
            description="Quando você adicionar gastos ou entradas, eles aparecerão aqui."
        />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter('todos')}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeFilter === 'todos' ? 'bg-[#3B82F6] text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Todos
        </button>
        {members.map(member => (
          <button
            key={member.id}
            onClick={() => setActiveFilter(member.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${activeFilter === member.id ? 'bg-[#3B82F6] text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {member.name}
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-100">
        {filteredTransactions.map(tx => {
          const member = members.find(m => m.id === tx.memberId);
          return <TransactionItem key={tx.id} transaction={tx} member={member} />;
        })}
      </div>

      <div className="mt-6 p-4 bg-rose-50 text-rose-800 rounded-xl text-center">
        💡 <span className="font-semibold">Dica do mês:</span> Tente cozinhar em casa 2x na semana — vocês podem economizar em média R$ 200!
      </div>
    </div>
  );
};

export default Transactions;
