
import { BusinessData, User, BusinessConfig } from '../types.ts';

/**
 * CLOUD DATABASE CONFIGURATION - PANTRY CLOUD
 */
const PANTRY_ID = 'a1fda8ac-63ac-4b27-a992-dc2a6b16b3da'; 
const API_BASE = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/`;
const USERS_REGISTRY_BASKET = 'global_users_v2';
const DATA_PREFIX = 'biz_data_';
const SESSION_KEY = 'bizsmart_active_session';
const TIMEOUT = 15000;

export const storageService = {
  // --- Private Cloud Helpers ---
  
  _fetchCloud: async (basketName: string) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT);
      
      const resp = await fetch(`${API_BASE}${basketName}`, { 
        signal: controller.signal,
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(id);
      
      if (resp.status === 400 || resp.status === 404) return null;
      if (!resp.ok) throw new Error(`Pantry Fetch Error: ${resp.status}`);
      
      return await resp.json();
    } catch (e: any) {
      console.error(`Pantry Fetch Failure [${basketName}]:`, e.message);
      return null;
    }
  },

  _saveCloud: async (basketName: string, data: any) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT);
      
      const resp = await fetch(`${API_BASE}${basketName}`, {
        method: 'POST',
        mode: 'cors',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(id);
      
      if (!resp.ok) {
        throw new Error(`Pantry Save Error: ${resp.status}`);
      }
      return true;
    } catch (e: any) {
      console.error(`Pantry Save Failure [${basketName}]:`, e.message);
      return false;
    }
  },

  // --- Public Interface ---

  getUsers: async (): Promise<User[]> => {
    const registry = await storageService._fetchCloud(USERS_REGISTRY_BASKET);
    return (registry && Array.isArray(registry.users)) ? registry.users : [];
  },

  registerUser: async (username: string, password: string, initialConfig: BusinessConfig): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase();
    
    // Prevent registering with reserved 'Admin' name
    if (cleanUsername === 'admin') return false;

    const users = await storageService.getUsers();
    
    if (users.find(u => u.username.toLowerCase() === cleanUsername)) {
      console.warn("User already exists");
      return false;
    }

    const newUser = { 
      username: cleanUsername, 
      password, 
      lastLogin: new Date().toISOString() 
    };
    
    const registrySuccess = await storageService._saveCloud(USERS_REGISTRY_BASKET, { 
      users: [...users, newUser] 
    });
    
    if (!registrySuccess) return false;

    const initialData: BusinessData = {
      config: initialConfig,
      sales: [],
      expenses: [],
      inventory: []
    };
    await storageService.saveUserData(cleanUsername, initialData);
    
    return true;
  },

  authenticate: async (username: string, password: string): Promise<User | null> => {
    const cleanUsername = username.trim();
    
    // Hardcoded Admin Access
    if (cleanUsername === 'Admin' && password === '676') {
      const adminUser: User = { 
        username: 'Admin', 
        lastLogin: new Date().toISOString(),
        isAdmin: true 
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      return adminUser;
    }

    const lowerUsername = cleanUsername.toLowerCase();
    const users = await storageService.getUsers();
    const user = users.find(u => u.username.toLowerCase() === lowerUsername && u.password === password);
    
    if (user) {
      const { password: _, ...safeUser } = user;
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
      return safeUser as User;
    }
    return null;
  },

  deleteUser: async (username: string): Promise<boolean> => {
    const users = await storageService.getUsers();
    const filtered = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    return storageService._saveCloud(USERS_REGISTRY_BASKET, { users: filtered });
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: (): User | null => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  loadUserData: async (username: string): Promise<BusinessData> => {
    const cleanUsername = username.trim().toLowerCase();
    const data = await storageService._fetchCloud(`${DATA_PREFIX}${cleanUsername}`);
    if (data) return data;
    
    return {
      config: null,
      sales: [],
      expenses: [],
      inventory: []
    };
  },

  saveUserData: async (username: string, data: BusinessData) => {
    const cleanUsername = username.trim().toLowerCase();
    return storageService._saveCloud(`${DATA_PREFIX}${cleanUsername}`, data);
  }
};
