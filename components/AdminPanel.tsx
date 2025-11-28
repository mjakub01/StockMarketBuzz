
import React, { useEffect, useState } from 'react';
import { getAllUsers, deleteUser } from '../services/authService';
import { User, FeatureFlags } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { features, toggleFeature } = useSystem();

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      await deleteUser(userId);
      loadUsers();
    }
  };

  const featureLabels: Record<keyof FeatureFlags, string> = {
    enableMomentum: 'Momentum Scanner',
    enableEarnings: 'Earnings Scanner',
    enableMovers: 'Market Movers',
    enableOversold: 'Oversold Scanner',
    enableInsider: 'Insider Tracker',
    enableHeatmaps: 'Market Heatmaps',
    enableNews: 'News Feed',
    enableCrypto: 'Crypto Movers',
    enableGlobalRefresh: 'Global Refresh Button'
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="text-4xl">👮‍♂️</span>
          <span>Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Panel</span></span>
        </h1>
        <p className="text-gray-400 mt-2">Manage registered users and system-wide feature availability.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Management Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
            <h3 className="font-bold text-white text-lg">Registered Users ({users.length})</h3>
            <button 
              onClick={loadUsers} 
              className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-700"
            >
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading users...</div>
          ) : (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left">
                <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase font-bold sticky top-0 bg-gray-900">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="p-4">
                         <div className="font-bold text-white">{u.name} {u.id === currentUser?.id && '(You)'}</div>
                         <div className="text-xs text-gray-500 font-mono">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-red-900/40 text-red-400 border border-red-500/30' : 'bg-blue-900/40 text-blue-400 border border-blue-500/30'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleDelete(u.id)}
                            className="text-red-400 hover:text-white bg-red-900/20 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Controls Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl h-fit">
           <div className="p-6 border-b border-gray-800 bg-gray-900/50">
             <h3 className="font-bold text-white text-lg">System Feature Controls</h3>
             <p className="text-xs text-gray-400 mt-1">Enable or disable features for ALL users instantly.</p>
           </div>
           <div className="p-6 space-y-4">
              {Object.keys(featureLabels).map((key) => {
                 const flagKey = key as keyof FeatureFlags;
                 return (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                       <span className="text-gray-200 font-medium">{featureLabels[flagKey]}</span>
                       <button
                         onClick={() => toggleFeature(flagKey)}
                         className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${features[flagKey] ? 'bg-green-500' : 'bg-gray-700'}`}
                       >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${features[flagKey] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                       </button>
                    </div>
                 );
              })}
           </div>
           <div className="p-4 bg-yellow-900/20 text-yellow-500 text-xs border-t border-gray-800">
             ⚠️ Disabling a feature hides it from the sidebar and disables access for regular users. Changes apply immediately.
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
