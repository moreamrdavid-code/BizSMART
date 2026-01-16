
import { BusinessData, User, BusinessConfig } from '../types.ts';

/**
 * CLOUD DATABASE CONFIGURATION - PANTRY CLOUD
 * Enhanced with LocalStorage fallback for high reliability.
 */
const PANTRY_ID = 'a1fda8ac-63ac-4b27-a992-dc2a6b16b3da'; 
const API_BASE = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket/`;
const USERS_REGISTRY_BASKET = 'global_users_v2';
const DATA_PREFIX = 'biz_data_';
const SESSION_KEY = 'bizsmart_active_session';
const LOCAL_DATA_PREFIX = 'local_biz_data_';
const LOCAL_USERS_KEY = 'local_users_registry';
const TIMEOUT = 8000; // Reduced timeout for snappier fallback

export const storageService = {
  // --- Private Cloud Helpers ---
  
  _fetchCloud: async (basketName: string) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT);
      
      const resp = await fetch(`${API_BASE}${basketName}`, { 
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearTimeout(id);
      
      if (resp.status === 400 || resp.status === 404) return null;
      if (!resp.ok) throw new Error(`Pantry status: ${resp.status}`);
      
      return await resp.json();
    } catch (e: any) {
      console.warn(`Cloud fetch failed [${basketName}], using local fallback.`, e.message);
      return null;
    }
  },

  _saveCloud: async (basketName: string, data: any) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT);
      
      const resp = await fetch(`${API_BASE}${basketName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(id);
      return resp.ok;
    } catch (e: any) {
      console.warn(`Cloud save failed [${basketName}], cached locally.`, e.message);
      return false;
    }
  },

  // --- Public Interface ---

  getUsers: async (): Promise<User[]> => {
    // Attempt cloud first
    const registry = await storageService._fetchCloud(USERS_REGISTRY_BASKET);
    if (registry && Array.isArray(registry.users)) {
      // Sync local cache
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(registry.users));
      return registry.users;
    }
    
    // Fallback to local
    const local = localStorage.getItem(LOCAL_USERS_KEY);
    return local ? JSON.parse(local) : [];
  },

  registerUser: async (username: string, password: string, initialConfig: BusinessConfig): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername === 'admin') return false;

    const users = await storageService.getUsers();
    if (users.find(u => u.username.toLowerCase() === cleanUsername)) return false;

    const newUser = { 
      username: cleanUsername, 
      password, 
      lastLogin: new Date().toISOString() 
    };
    
    const updatedUsers = [...users, newUser];
    
    // Save locally first for immediate feedback
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updatedUsers));
    
    // Attempt cloud sync
    await storageService._saveCloud(USERS_REGISTRY_BASKET, { users: updatedUsers });

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
    
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(filtered));
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
    
    // Attempt cloud
    const cloudData = await storageService._fetchCloud(`${DATA_PREFIX}${cleanUsername}`);
    if (cloudData) {
      // Sync local cache
      localStorage.setItem(`${LOCAL_DATA_PREFIX}${cleanUsername}`, JSON.stringify(cloudData));
      return cloudData;
    }
    
    // Fallback to local cache
    const local = localStorage.getItem(`${LOCAL_DATA_PREFIX}${cleanUsername}`);
    if (local) return JSON.parse(local);
    
    return {
      config: null,
      sales: [],
      expenses: [],
      inventory: []
    };
  },

  saveUserData: async (username: string, data: BusinessData) => {
    const cleanUsername = username.trim().toLowerCase();
    
    // Always update local storage first (instant durability)
    localStorage.setItem(`${LOCAL_DATA_PREFIX}${cleanUsername}`, JSON.stringify(data));
    
    // Sync to cloud in background
    return storageService._saveCloud(`${DATA_PREFIX}${cleanUsername}`, data);
  }
};
