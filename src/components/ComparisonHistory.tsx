import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storageService } from '@/services/storage';
import { Comparison } from '@/types';
import { formatCurrency, formatDate } from '@/utils/calculations';
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
import { useState } from 'react';

interface ComparisonHistoryProps {
  comparisons: Comparison[];
  onComparisonDeleted: () => void;
}

export const ComparisonHistory = ({ comparisons, onComparisonDeleted }: ComparisonHistoryProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    storageService.deleteComparison(id);
    onComparisonDeleted();
    setDeleteId(null);
  };

  if (comparisons.length === 0) {
    return (
      <Card className="p-8 text-center animate-fade-in">
        <Icon name="History" className="mx-auto mb-3 text-muted-foreground" size={48} />
        <p className="text-muted-foreground">История сравнений пуста</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {comparisons.map((comparison, index) => (
        <Card key={comparison.id} className="p-4 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-3">
                {formatDate(comparison.date)}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg ${comparison.betterOption === 'X' ? 'bg-primary/10 border border-primary' : 'bg-muted'}`}>
                  <div className="text-xs text-muted-foreground mb-1">{comparison.nameX || 'Товар X'}</div>
                  <div className="font-semibold">{formatCurrency(comparison.priceX)}</div>
                  <div className="text-xs text-muted-foreground">{comparison.weightX}г</div>
                  <div className="text-sm font-bold mt-1">{formatCurrency(comparison.pricePerGramX)}/г</div>
                  {comparison.betterOption === 'X' && (
                    <div className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                      <Icon name="CheckCircle2" size={12} />
                      -{comparison.savingsPercent.toFixed(0)}%
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${comparison.betterOption === 'Y' ? 'bg-primary/10 border border-primary' : 'bg-muted'}`}>
                  <div className="text-xs text-muted-foreground mb-1">{comparison.nameY || 'Товар Y'}</div>
                  <div className="font-semibold">{formatCurrency(comparison.priceY)}</div>
                  <div className="text-xs text-muted-foreground">{comparison.weightY}г</div>
                  <div className="text-sm font-bold mt-1">{formatCurrency(comparison.pricePerGramY)}/г</div>
                  {comparison.betterOption === 'Y' && (
                    <div className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                      <Icon name="CheckCircle2" size={12} />
                      -{comparison.savingsPercent.toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteId(comparison.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Icon name="Trash2" size={18} />
            </Button>
          </div>
        </Card>
      ))}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сравнение?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Запись будет удалена навсегда.
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