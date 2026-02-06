import { useState, useEffect } from 'react';
import { CompareForm } from '@/components/CompareForm';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { ExpenseAnalytics } from '@/components/ExpenseAnalytics';
import { ComparisonHistory } from '@/components/ComparisonHistory';
import { BottomNav } from '@/components/BottomNav';
import { storageService } from '@/services/storage';
import { Comparison, Expense } from '@/types';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'compare' | 'expenses' | 'analytics' | 'history'>('compare');
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const loadData = () => {
    setComparisons(storageService.getComparisons());
    setExpenses(storageService.getExpenses());
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-card border-b border-border shadow-sm z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Icon name="ShoppingBasket" className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Анализатор цен</h1>
              <p className="text-xs text-muted-foreground">Учёт продуктовых расходов</p>
            </div>
          </div>
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-6">
        {activeTab === 'compare' && (
          <div>
            <CompareForm />
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <ExpenseForm onExpenseAdded={loadData} />
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="List" className="text-primary" />
                Список расходов
              </h2>
              <ExpenseList expenses={expenses} onExpenseDeleted={loadData} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="TrendingUp" className="text-primary" />
              Аналитика расходов
            </h2>
            <ExpenseAnalytics expenses={expenses} />
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Icon name="Clock" className="text-primary" />
              История сравнений
            </h2>
            <ComparisonHistory comparisons={comparisons} onComparisonDeleted={loadData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;