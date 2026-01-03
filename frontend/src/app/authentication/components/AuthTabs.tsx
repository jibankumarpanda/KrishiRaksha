'use client';



interface AuthTabsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

const AuthTabs = ({ activeTab, onTabChange }: AuthTabsProps) => {
  return (
    <div className="flex border-b border-border mb-6">
      <button
        onClick={() => onTabChange('login')}
        className={`flex-1 py-3 text-base font-body font-medium transition-all duration-200 ${
          activeTab === 'login' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-foreground'
        }`}
      >
        Login
      </button>
      <button
        onClick={() => onTabChange('register')}
        className={`flex-1 py-3 text-base font-body font-medium transition-all duration-200 ${
          activeTab === 'register' ?'text-primary border-b-2 border-primary' :'text-text-secondary hover:text-foreground'
        }`}
      >
        Register
      </button>
    </div>
  );
};

export default AuthTabs;
