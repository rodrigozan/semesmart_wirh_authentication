
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import EmptyState from './common/EmptyState';
import api from '../api';

interface ReportsProps {
  transactions: Transaction[];
}

interface AIInsight {
  title: string;
  description: string;
}

const COLORS = ['#52C293', '#3B82F6', '#EC4899', '#FBBF24', '#A78BFA', '#F87171'];

const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const expenses = useMemo(() => transactions.filter(t => t.amount < 0), [transactions]);

  const dataForPieChart = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    expenses.forEach(t => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += Math.abs(t.amount);
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  useEffect(() => {
    if (expenses.length > 5) { // Fetch insights only if there's enough data
      const fetchInsights = async () => {
        setIsLoadingInsights(true);
        setInsightsError(null);
        try {
          const recentExpenses = expenses.slice(0, 30); // Use up to 30 recent expenses for analysis
          const result = await api.getAIFinancialInsights(recentExpenses);
          setInsights(result);
        } catch (error) {
          console.error("Error fetching AI insights:", error);
          setInsightsError("Não foi possível carregar as sugestões da IA. Tente novamente mais tarde.");
        } finally {
          setIsLoadingInsights(false);
        }
      };
      fetchInsights();
    } else {
      setIsLoadingInsights(false);
    }
  }, [expenses]);

  if (expenses.length === 0) {
      return (
          <EmptyState
              icon="📊"
              title="Sem dados para os relatórios"
              description="Adicione algumas despesas para que possamos gerar gráficos e insights para você."
          />
      );
  }

  const renderInsights = () => {
    if (isLoadingInsights) {
        return (
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <p className="font-semibold text-gray-600 animate-pulse">🧠 Analisando seus gastos...</p>
            </div>
        );
    }
    if (insightsError) {
        return (
            <div className="text-center p-4 bg-red-50 text-red-700 rounded-xl shadow-sm">
                <p className="font-semibold">Oops!</p>
                <p className="text-sm">{insightsError}</p>
            </div>
        );
    }
    if (insights.length > 0) {
        return (
            <div className="space-y-3">
                {insights.map((insight, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm">
                        <p className="font-semibold text-gray-700">💡 {insight.title}</p>
                        <p className="text-sm text-gray-500">{insight.description}</p>
                    </div>
                ))}
            </div>
        );
    }
    return (
       <p className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-xl text-center text-sm">
          Continue adicionando transações. A IA irá gerar um resumo automático dos seus gastos aqui assim que tiver dados suficientes.
        </p>
    );
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Visão Geral do Mês</h2>
        <div className="w-full h-72 bg-white p-4 rounded-2xl shadow-sm">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dataForPieChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {dataForPieChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Total']} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Sugestões da IA</h2>
        {renderInsights()}
      </section>
    </div>
  );
};

export default Reports;