
import * as React from 'react';
import { storageService } from '../services/storageService.ts';
import { User } from '../types.ts';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const allUsers = await storageService.getUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  React.useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? All registry access will be revoked.`)) return;
    
    setDeletingId(username);
    const success = await storageService.deleteUser(username);
    if (success) {
      setUsers(prev => prev.filter(u => u.username !== username));
    } else {
      alert("Failed to delete user.");
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white p-6 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3">
              <span className="bg-blue-600 p-1.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              BIZSMART CENTRAL ADMIN
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">System Master Control Panel</p>
          </div>
          <button 
            onClick={onLogout}
            className="bg-slate-800 hover:bg-rose-900/50 text-white px-6 py-2.5 rounded-xl font-black text-xs transition-all border border-slate-700"
          >
            SECURE LOGOUT
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Customers</p>
            <h3 className="text-4xl font-black text-slate-900">{users.length}</h3>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Sessions</p>
            <h3 className="text-4xl font-black text-blue-600">Online</h3>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Database Status</p>
            <h3 className="text-4xl font-black text-emerald-500">Stable</h3>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">Registered User Registry</h2>
            <button 
              onClick={loadUsers}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-24 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Global Registry...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-5">User Account</th>
                    <th className="px-8 py-5">Last Login Activity</th>
                    <th className="px-8 py-5 text-right">Master Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-20 text-center text-slate-300 font-black uppercase text-xs">No customer records found.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.username} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                              {u.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-black text-slate-900">{u.username}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Business Owner</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-slate-500">{new Date(u.lastLogin).toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => handleDelete(u.username)}
                            disabled={deletingId === u.username}
                            className={`bg-rose-50 text-rose-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all ${deletingId === u.username ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {deletingId === u.username ? 'Deleting...' : 'Delete Account'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
