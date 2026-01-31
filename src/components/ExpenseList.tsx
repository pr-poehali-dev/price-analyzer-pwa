import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { storageService } from '@/services/storage';
import { Expense } from '@/types';
import { formatCurrency, formatDate, getMonthYear } from '@/utils/calculations';
import Icon from '@/components/ui/icon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted: () => void;
}

export const ExpenseList = ({ expenses, onExpenseDeleted }: ExpenseListProps) => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const months = Array.from(new Set(expenses.map(e => getMonthYear(e.date)))).sort().reverse();

  const filteredExpenses = selectedMonth === 'all' 
    ? expenses 
    : expenses.filter(e => getMonthYear(e.date) === selectedMonth);

  const handleDelete = (id: string) => {
    storageService.deleteExpense(id);
    onExpenseDeleted();
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Label className="text-sm font-medium mb-2 block">Фильтр по месяцу</Label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все месяцы</SelectItem>
            {months.map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <Card className="p-8 text-center">
            <Icon name="ShoppingBag" className="mx-auto mb-3 text-muted-foreground" size={48} />
            <p className="text-muted-foreground">Расходов пока нет</p>
          </Card>
        ) : (
          filteredExpenses.map((expense, index) => (
            <Card key={expense.id} className="p-4 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{formatCurrency(expense.amount)}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {expense.category}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {formatDate(expense.date)}
                  </div>
                  {expense.comment && (
                    <div className="text-sm text-foreground mt-2 bg-muted/50 p-2 rounded">
                      {expense.comment}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(expense.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить расход?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Расход будет удалён навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);
