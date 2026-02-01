import Icon from '@/components/ui/icon';

interface BottomNavProps {
  activeTab: 'compare' | 'expenses' | 'analytics' | 'history';
  onTabChange: (tab: 'compare' | 'expenses' | 'analytics' | 'history') => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'compare' as const, label: 'Сравнение', icon: 'Calculator' },
    { id: 'expenses' as const, label: 'Расходы', icon: 'Wallet' },
    { id: 'analytics' as const, label: 'Аналитика', icon: 'PieChart' },
    { id: 'history' as const, label: 'История', icon: 'History' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1 p-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon name={tab.icon as any} size={20} />
            <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};