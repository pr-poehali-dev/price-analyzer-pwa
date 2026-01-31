import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculatePricePerGram, calculateSavingsPercent, formatCurrency } from '@/utils/calculations';
import { storageService } from '@/services/storage';
import { Comparison } from '@/types';
import Icon from '@/components/ui/icon';

export const CompareForm = () => {
  const [priceX, setPriceX] = useState('');
  const [weightX, setWeightX] = useState('');
  const [priceY, setPriceY] = useState('');
  const [weightY, setWeightY] = useState('');
  const [result, setResult] = useState<{ pricePerGramX: number; pricePerGramY: number; betterOption: 'X' | 'Y'; savingsPercent: number } | null>(null);

  const handleCompare = () => {
    const pX = parseFloat(priceX);
    const wX = parseFloat(weightX);
    const pY = parseFloat(priceY);
    const wY = parseFloat(weightY);

    if (isNaN(pX) || isNaN(wX) || isNaN(pY) || isNaN(wY) || wX <= 0 || wY <= 0 || pX < 0 || pY < 0) {
      return;
    }

    const pricePerGramX = calculatePricePerGram(pX, wX);
    const pricePerGramY = calculatePricePerGram(pY, wY);
    const betterOption: 'X' | 'Y' = pricePerGramX < pricePerGramY ? 'X' : 'Y';
    const savingsPercent = calculateSavingsPercent(pricePerGramX, pricePerGramY);

    setResult({ pricePerGramX, pricePerGramY, betterOption, savingsPercent });

    const comparison: Comparison = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      priceX: pX,
      weightX: wX,
      priceY: pY,
      weightY: wY,
      pricePerGramX,
      pricePerGramY,
      betterOption,
      savingsPercent
    };

    storageService.saveComparison(comparison);
  };

  const handleReset = () => {
    setPriceX('');
    setWeightX('');
    setPriceY('');
    setWeightY('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 animate-fade-in">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="ShoppingBasket" className="text-primary" />
          Товар X
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="priceX">Цена (₽)</Label>
            <Input
              id="priceX"
              type="number"
              placeholder="150"
              value={priceX}
              onChange={(e) => setPriceX(e.target.value)}
              className="text-lg"
            />
          </div>
          <div>
            <Label htmlFor="weightX">Вес (г)</Label>
            <Input
              id="weightX"
              type="number"
              placeholder="500"
              value={weightX}
              onChange={(e) => setWeightX(e.target.value)}
              className="text-lg"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="ShoppingCart" className="text-primary" />
          Товар Y
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="priceY">Цена (₽)</Label>
            <Input
              id="priceY"
              type="number"
              placeholder="220"
              value={priceY}
              onChange={(e) => setPriceY(e.target.value)}
              className="text-lg"
            />
          </div>
          <div>
            <Label htmlFor="weightY">Вес (г)</Label>
            <Input
              id="weightY"
              type="number"
              placeholder="800"
              value={weightY}
              onChange={(e) => setWeightY(e.target.value)}
              className="text-lg"
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleCompare} className="flex-1 h-12 text-base" size="lg">
          <Icon name="Calculator" className="mr-2" />
          Сравнить
        </Button>
        <Button onClick={handleReset} variant="outline" className="h-12" size="lg">
          <Icon name="RotateCcw" />
        </Button>
      </div>

      {result && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/20 animate-scale-in">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="TrendingDown" className="text-primary" />
            Результат
          </h3>
          <div className="space-y-3">
            <div className={`p-4 rounded-lg ${result.betterOption === 'X' ? 'bg-primary/20 border-2 border-primary' : 'bg-muted'}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Товар X:</span>
                <span className="text-lg font-bold">{formatCurrency(result.pricePerGramX)}/г</span>
              </div>
              {result.betterOption === 'X' && (
                <div className="mt-2 text-sm text-primary font-semibold flex items-center gap-1">
                  <Icon name="CheckCircle2" size={16} />
                  Выгоднее на {result.savingsPercent.toFixed(1)}%
                </div>
              )}
            </div>
            <div className={`p-4 rounded-lg ${result.betterOption === 'Y' ? 'bg-primary/20 border-2 border-primary' : 'bg-muted'}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Товар Y:</span>
                <span className="text-lg font-bold">{formatCurrency(result.pricePerGramY)}/г</span>
              </div>
              {result.betterOption === 'Y' && (
                <div className="mt-2 text-sm text-primary font-semibold flex items-center gap-1">
                  <Icon name="CheckCircle2" size={16} />
                  Выгоднее на {result.savingsPercent.toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
