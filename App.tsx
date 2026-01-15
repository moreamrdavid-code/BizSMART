
import * as React from 'react';
import { BusinessData, ViewType, User, Sale } from './types.ts';
import { storageService } from './services/storageService.ts';
import Layout from './components/Layout.tsx';
import Auth from './components/Auth.tsx';
import Dashboard from './components/Dashboard.tsx';
import SalesEntry from './components/SalesEntry.tsx';
import ExpenseEntry from './components/ExpenseEntry.tsx';
import Inventory from './components/Inventory.tsx';
import Reports from './components/Reports.tsx';
import Settings from './components/Settings.tsx';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = React.useState<User | null>(() => storageService.getSession());
  const [data, setData] = React.useState<BusinessData>({
    config: null,
    sales: [],
    expenses: [],
    inventory: []
  });
  const [activeView, setActiveView] = React.useState<ViewType>('dashboard');
  const [isInitializing, setIsInitializing] = React.useState(false);

  React.useEffect(() => {
    const initData = async () => {
      if (currentUser) {
        setIsInitializing(true);
        const userData = await storageService.loadUserData(currentUser.username);
        setData(userData);
        setIsInitializing(false);
      }
    };
    initData();
  }, [currentUser]);

  const handleUpdateData = async (newData: BusinessData) => {
    setData(newData);
    if (currentUser) {
      await storageService.saveUserData(currentUser.username, newData);
    }
  };

  const handleAddSale = (sale: Sale) => {
    let updatedInventory = [...data.inventory];
    
    if (sale.stockItemId) {
      updatedInventory = updatedInventory.map(item => {
        if (item.id === sale.stockItemId) {
          return {
            ...item,
            currentQuantity: Math.max(0, item.currentQuantity - (sale.quantity || 0))
          };
        }
        return item;
      });
    }

    handleUpdateData({
      ...data,
      sales: [...data.sales, sale],
      inventory: updatedInventory
    });
  };

  const handleDeleteSale = (saleId: string) => {
    const saleToDelete = data.sales.find(s => s.id === saleId);
    let updatedInventory = [...data.inventory];

    if (saleToDelete?.stockItemId) {
      updatedInventory = updatedInventory.map(item => {
        if (item.id === saleToDelete.stockItemId) {
          return {
            ...item,
            currentQuantity: item.currentQuantity + (saleToDelete.quantity || 0)
          };
        }
        return item;
      });
    }

    handleUpdateData({
      ...data,
      sales: data.sales.filter(s => s.id !== saleId),
      inventory: updatedInventory
    });
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
  };

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Syncing Cloud Database</p>
      </div>
    );
  }

  const lang = data.config?.language || 'en';

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView} 
      companyName={data.config?.companyName || ''}
      lang={lang}
      onLogout={handleLogout}
    >
      {activeView === 'dashboard' && <Dashboard data={data} onUpdateData={handleUpdateData} />}
      {activeView === 'sales' && (
        <SalesEntry 
          sales={data.sales} 
          inventory={data.inventory}
          onAddSale={handleAddSale} 
          onDeleteSale={handleDeleteSale} 
          currency={data.config?.currency || '৳'}
          lang={lang}
        />
      )}
      {activeView === 'expenses' && (
        <ExpenseEntry 
          expenses={data.expenses} 
          onAddExpense={(e) => handleUpdateData({...data, expenses: [...data.expenses, e]})}
          onDeleteExpense={(id) => handleUpdateData({...data, expenses: data.expenses.filter(e => e.id !== id)})}
          currency={data.config?.currency || '৳'}
          lang={lang}
        />
      )}
      {activeView === 'inventory' && (
        <Inventory 
          inventory={data.inventory}
          onAddStockItem={(i) => handleUpdateData({...data, inventory: [...data.inventory, i]})}
          onDeleteStockItem={(id) => handleUpdateData({...data, inventory: data.inventory.filter(i => i.id !== id)})}
          currency={data.config?.currency || '৳'}
          lang={lang}
        />
      )}
      {activeView === 'reports' && <Reports data={data} />}
      {activeView === 'settings' && (
        <Settings config={data.config!} onUpdateConfig={(c) => handleUpdateData({...data, config: c})} />
      )}
    </Layout>
  );
};

export default App;
