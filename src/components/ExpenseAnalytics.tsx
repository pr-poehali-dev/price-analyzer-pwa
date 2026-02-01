import { Card } from '@/components/ui/card';
import { Expense, CategoryStats } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Icon from '@/components/ui/icon';

interface ExpenseAnalyticsProps {
  expenses: Expense[];
}

const COLORS = ['#ec4899', '#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#6366f1', '#ef4444'];

export const ExpenseAnalytics = ({ expenses }: ExpenseAnalyticsProps) => {
  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center animate-fade-in">
        <Icon name="PieChart" className="mx-auto mb-3 text-muted-foreground" size={48} />
        <p className="text-muted-foreground">Добавьте расходы для просмотра аналитики</p>
      </Card>
    );
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryMap = new Map<string, number>();
  expenses.forEach(e => {
    categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
  });

  const stats: CategoryStats[] = Array.from(categoryMap.entries())
    .map(([category, amount], index) => ({
      category,
      total: amount,
      percentage: (amount / total) * 100,
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.total - a.total);

  const chartData = stats.map(s => ({
    name: s.category,
    value: s.total
  }));

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/20 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Icon name="Wallet" className="text-primary" size={32} />
          <div>
            <p className="text-sm text-muted-foreground">Общие расходы</p>
            <p className="text-3xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="PieChart" className="text-primary" />
          Распределение по категориям
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="BarChart3" className="text-primary" />
          Детализация
        </h3>
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div key={stat.category} className="animate-fade-in" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="font-medium">{stat.category}</span>
                </div>
                <span className="font-semibold">{formatCurrency(stat.total)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {stat.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};