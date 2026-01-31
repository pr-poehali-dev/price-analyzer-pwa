import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { storageService } from '@/services/storage';
import { Expense } from '@/types';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
}

export const ExpenseForm = ({ onExpenseAdded }: ExpenseFormProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  const categories = storageService.getCategories();

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (!date || isNaN(amountNum) || amountNum <= 0 || !category) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      date,
      amount: amountNum,
      category,
      comment: comment || undefined
    };

    storageService.saveExpense(expense);
    
    setAmount('');
    setCategory('');
    setComment('');
    setDate(new Date().toISOString().split('T')[0]);
    
    toast({
      title: 'Готово!',
      description: 'Расход добавлен',
    });
    
    onExpenseAdded();
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      storageService.addCategory(newCategory.trim());
      setCategory(newCategory.trim());
      setNewCategory('');
      setShowNewCategory(false);
    }
  };

  return (
    <Card className="p-6 animate-fade-in">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Icon name="Plus" className="text-primary" />
        Новый расход
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="date">Дата</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-base"
          />
        </div>

        <div>
          <Label htmlFor="amount">Сумма (₽)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
          />
        </div>

        <div>
          <Label htmlFor="category">Категория</Label>
          {showNewCategory ? (
            <div className="flex gap-2">
              <Input
                placeholder="Название категории"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="text-base"
              />
              <Button onClick={handleAddCategory} size="sm">
                <Icon name="Check" />
              </Button>
              <Button onClick={() => setShowNewCategory(false)} variant="outline" size="sm">
                <Icon name="X" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowNewCategory(true)} variant="outline" size="sm">
                <Icon name="Plus" size={18} />
              </Button>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="comment">Комментарий (необязательно)</Label>
          <Textarea
            id="comment"
            placeholder="Например: молоко, хлеб, сыр"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="text-base resize-none"
            rows={3}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full h-12 text-base" size="lg">
          <Icon name="Check" className="mr-2" />
          Добавить расход
        </Button>
      </div>
    </Card>
  );
};
