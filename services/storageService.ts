
import { BusinessData, User, BusinessConfig } from '../types';

const USERS_REGISTRY_KEY = 'bizpulse_users_registry';
const CURRENT_SESSION_KEY = 'bizpulse_active_session';
const DATA_PREFIX = 'bizpulse_data_';

export const storageService = {
  // User Management
  registerUser: (username: string, password: string, initialConfig?: BusinessConfig): boolean => {
    const users = storageService.getUsers();
    if (users.find(u => u.username === username)) return false;
    
    users.push({ username, password, lastLogin: new Date().toISOString() });
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));

    if (initialConfig) {
      const initialData: BusinessData = {
        config: initialConfig,
        sales: [],
        expenses: [],
        inventory: []
      };
      storageService.saveUserData(username, initialData);
    }
    
    return true;
  },

  authenticate: (username: string, password: string): User | null => {
    const users = storageService.getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password, ...safeUser } = user;
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(safeUser));
      return safeUser;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  },

  getSession: (): User | null => {
    const saved = localStorage.getItem(CURRENT_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  getUsers: (): any[] => {
    const saved = localStorage.getItem(USERS_REGISTRY_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  // Business Data Management (Partitioned by Username)
  loadUserData: (username: string): BusinessData => {
    const saved = localStorage.getItem(`${DATA_PREFIX}${username}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return {
      config: null,
      sales: [],
      expenses: [],
      inventory: []
    };
  },

  saveUserData: (username: string, data: BusinessData) => {
    localStorage.setItem(`${DATA_PREFIX}${username}`, JSON.stringify(data));
  }
};
