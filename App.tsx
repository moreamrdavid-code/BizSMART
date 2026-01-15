
import React, { useState, useEffect, useCallback } from 'react';
import { BusinessData, BusinessConfig, Sale, Expense, StockItem, ViewType, User } from './types.ts';
import { storageService } from './services/storageService.ts';
import Layout from './components/Layout.tsx';
import Auth from './components/Auth.tsx';
import Dashboard from './components/Dashboard.tsx';
import SalesEntry from './components/SalesEntry.tsx';
import ExpenseEntry from './components/ExpenseEntry.tsx';
import Inventory from './components/Inventory.tsx';
import Reports from './components/Reports.tsx';
import Settings from './components/Settings.tsx';
import { getTranslation, Language } from './translations.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getSession());
  const [data, setData] = useState<BusinessData>({
    config: null,
    sales: [],
    expenses: [],
    inventory: []
  });
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  // Load user-specific data whenever user changes
  useEffect(() => {
    if (currentUser) {
      const userData = storageService.loadUserData(currentUser.username);
      setData(userData);
    } else {
      setData({ config: null, sales: [], expenses: [], inventory: [] });
    }
  }, [currentUser]);

  // Save user-specific data whenever data changes
  useEffect(() => {
    if (currentUser && data.config) {
      storageService.saveUserData(currentUser.username, data);
    }
  }, [data, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  const handleUpdateConfig = useCallback((config: BusinessConfig) => {
    setData(prev => ({ ...prev, config }));
  }, []);

  const handleAddSale = useCallback((sale: Sale) => {
    setData(prev => {
      let updatedInventory = [...prev.inventory];
      if (sale.stockItemId && sale.quantity) {
        updatedInventory = updatedInventory.map(item => {
          if (item.id === sale.stockItemId) {
            return { ...item, currentQuantity: Math.max(0, item.currentQuantity - sale.quantity!) };
          }
          return item;
        });
      }
      return { 
        ...prev, 
        sales: [...prev.sales, sale],
        inventory: updatedInventory
      };
    });
  }, []);

  const handleDeleteSale = useCallback((id: string) => {
    setData(prev => {
      const saleToDelete = prev.sales.find(s => s.id === id);
      let updatedInventory = [...prev.inventory];
      if (saleToDelete?.stockItemId && saleToDelete?.quantity) {
        updatedInventory = updatedInventory.map(item => {
          if (item.id === saleToDelete.stockItemId) {
            return { ...item, currentQuantity: item.currentQuantity + saleToDelete.quantity! };
          }
          return item;
        });
      }
      return { 
        ...prev, 
        sales: prev.sales.filter(s => s.id !== id),
        inventory: updatedInventory
      };
    });
  }, []);

  const handleAddExpense = useCallback((expense: Expense) => {
    setData(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
  }, []);

  const handleDeleteExpense = useCallback((id: string) => {
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  }, []);

  const handleAddStockItem = useCallback((item: StockItem) => {
    setData(prev => ({ ...prev, inventory: [...prev.inventory, item] }));
  }, []);

  const handleDeleteStockItem = useCallback((id: string) => {
    setData(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== id) }));
  }, []);

  // Show Auth if not logged in
  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const lang = data.config?.language || 'en';

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard data={data} />;
      case 'sales': return (
        <SalesEntry 
          sales={data.sales} 
          inventory={data.inventory}
          onAddSale={handleAddSale} 
          onDeleteSale={handleDeleteSale} 
          currency={data.config?.currency || '৳'}
          lang={lang}
        />
      );
      case 'expenses': return (
        <ExpenseEntry 
          expenses={data.expenses} 
          onAddExpense={handleAddExpense} 
          onDeleteExpense={handleDeleteExpense} 
          currency={data.config?.currency || '৳'}
          lang={lang}
        />
      );
      case 'inventory': return (
        <Inventory 
          inventory={data.inventory}
          onAddStockItem={handleAddStockItem}
          onDeleteStockItem={handleDeleteStockItem}
          currency={data.config?.currency || '৳'}
          lang={lang}
        />
      );
      case 'reports': return <Reports data={data} />;
      case 'settings': return (
        <Settings 
          config={data.config!} 
          onUpdateConfig={handleUpdateConfig} 
        />
      );
      default: return <Dashboard data={data} />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView} 
      companyName={data.config?.companyName || ''}
      lang={lang}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
