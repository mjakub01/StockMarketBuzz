
import React, { useState, useEffect } from 'react';
import { ApiProviderConfig, ApiKeyConfig, ApiProviderId } from '../types';
import { getApiKeys, saveApiKey, removeApiKey, testApiConnection, SUPPORTED_PROVIDERS, hasValidExternalProvider, getAIFallbackPreference, setAIFallbackPreference } from '../services/apiManager';
import { useAuth } from '../contexts/AuthContext';

const ApiConnectionSettings: React.FC = () => {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<Record<string, ApiKeyConfig>>({});
  const [editingId, setEditingId] = useState<ApiProviderId | null>(null);
  const [inputKey, setInputKey] = useState('');
  const [testingId, setTestingId] = useState<ApiProviderId | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string; data?: any } | null>(null);
  
  // AI Fallback State
  const [hasExternalKeys, setHasExternalKeys] = useState(false);
  const [useAIFallback, setUseAIFallback] = useState(false);

  useEffect(() => {
    refreshState();
  }, [user?.id]);

  const refreshState = () => {
    setConfigs(getApiKeys(user?.id));
    setHasExternalKeys(hasValidExternalProvider(user?.id));
    setUseAIFallback(getAIFallbackPreference(user?.id));
  };

  const handleEdit = (providerId: ApiProviderId) => {
    setEditingId(providerId);
    setInputKey(configs[providerId]?.apiKey || '');
    setTestResult(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setInputKey('');
    setTestResult(null);
  };

  const handleSave = async (providerId: ApiProviderId) => {
    const newConfig: ApiKeyConfig = {
      providerId,
      apiKey: inputKey,
      isEnabled: true,
      status: 'unknown',
      lastTested: undefined
    };
    
    saveApiKey(newConfig, user?.id);
    refreshState();
    
    // Auto-test
    handleTest(providerId, inputKey);
    setEditingId(null);
  };

  const handleTest = async (providerId: ApiProviderId, keyToTest?: string) => {
    setTestingId(providerId);
    setTestResult(null);
    const key = keyToTest || configs[providerId]?.apiKey;
    
    const result = await testApiConnection(providerId, key);
    
    const updatedConfig: ApiKeyConfig = {
      ...(configs[providerId] || { providerId, apiKey: key, isEnabled: true }),
      status: result.success ? 'valid' : 'invalid',
      lastTested: new Date().toISOString()
    };

    saveApiKey(updatedConfig, user?.id);
    
    setTestResult({ id: providerId, ...result });
    setTestingId(null);
    refreshState();
  };

  const handleToggle = (providerId: ApiProviderId) => {
    const config = configs[providerId];
    if (!config) return;
    const updated = { ...config, isEnabled: !config.isEnabled };
    saveApiKey(updated, user?.id);
    refreshState();
  };

  const handleDelete = (providerId: ApiProviderId) => {
    if (confirm('Are you sure you want to remove this API key?')) {
      removeApiKey(providerId, user?.id);
      refreshState();
    }
  };

  const toggleAIFallback = () => {
    setAIFallbackPreference(!useAIFallback, user?.id);
    refreshState();
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">API Integrations</h1>
        <p className="text-[var(--text-secondary)] mt-1">Manage connection keys for real-time market data providers.</p>
      </div>

      {/* AI Fallback Warning / Toggle */}
      {!hasExternalKeys && (
        <div className="mb-8 bg-yellow-900/10 border border-yellow-500/20 p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
              <h3 className="text-yellow-500 font-bold flex items-center gap-2">
                 ⚠️ No External Data Feeds Configured
              </h3>
              <p className="text-yellow-200/70 text-sm mt-1">
                 You haven't connected a live market data provider (like Polygon or IEX) yet.
              </p>
           </div>
           
           <button 
             onClick={toggleAIFallback}
             className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg
               ${useAIFallback 
                 ? 'bg-green-600 text-white hover:bg-green-500 shadow-green-900/20' 
                 : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700'}
             `}
           >
             {useAIFallback ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  AI Data Mode Active
                </>
             ) : (
                <>
                  <span>🧠</span> Use AI Fallback Data
                </>
             )}
           </button>
        </div>
      )}

      <div className="grid gap-6">
        {SUPPORTED_PROVIDERS.map((provider) => {
          const config = configs[provider.id];
          const isEditing = editingId === provider.id;
          const isTesting = testingId === provider.id;
          const hasKey = !!config?.apiKey;
          const currentTest = testResult?.id === provider.id ? testResult : null;

          return (
            <div key={provider.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm transition-all hover:border-[var(--accent-color)]">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                {/* Header Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-[var(--bg-main)] flex items-center justify-center text-2xl shadow-inner border border-[var(--border-color)]">
                    {provider.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                      {provider.name}
                      {hasKey && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border ${config.isEnabled ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                          {config.isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{provider.description}</p>
                    <a href={provider.website} target="_blank" rel="noreferrer" className="text-xs text-[var(--accent-color)] hover:underline mt-2 inline-block">
                      Get API Key &rarr;
                    </a>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                  {isEditing ? (
                    <div className="w-full md:w-80">
                      <input 
                        type="text" 
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        placeholder={`Enter ${provider.name} Key`}
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm mb-3 focus:outline-none focus:border-[var(--accent-color)]"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={handleCancel} className="px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
                        <button onClick={() => handleSave(provider.id)} className="px-4 py-1.5 text-xs font-bold bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90">Save Key</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {hasKey ? (
                        <div className="flex flex-col items-end gap-2 w-full">
                           <div className="flex items-center gap-2 bg-[var(--bg-main)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
                              <span className="text-xs font-mono text-[var(--text-secondary)]">
                                {config.apiKey.substring(0, 4)}...{config.apiKey.substring(config.apiKey.length - 4)}
                              </span>
                              {config.status === 'valid' && <span className="text-green-500" title="Valid">✓</span>}
                              {config.status === 'invalid' && <span className="text-red-500" title="Invalid">✕</span>}
                           </div>
                           
                           <div className="flex gap-2">
                              <button 
                                onClick={() => handleTest(provider.id)} 
                                disabled={isTesting}
                                className="text-xs text-[var(--accent-color)] font-bold hover:underline disabled:opacity-50"
                              >
                                {isTesting ? 'Testing...' : 'Test'}
                              </button>
                              <span className="text-[var(--border-color)]">|</span>
                              <button onClick={() => handleToggle(provider.id)} className="text-xs text-[var(--text-secondary)] hover:text-white">
                                {config.isEnabled ? 'Disable' : 'Enable'}
                              </button>
                              <span className="text-[var(--border-color)]">|</span>
                              <button onClick={() => handleEdit(provider.id)} className="text-xs text-[var(--text-secondary)] hover:text-white">Edit</button>
                              <span className="text-[var(--border-color)]">|</span>
                              <button onClick={() => handleDelete(provider.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                           </div>
                           
                           {/* Test Result Display */}
                           {currentTest && (
                              <div className={`mt-2 p-2 rounded text-[10px] w-full border ${currentTest.success ? 'bg-green-900/20 border-green-500/30 text-green-300' : 'bg-red-900/20 border-red-500/30 text-red-300'}`}>
                                 <strong>{currentTest.success ? 'SUCCESS' : 'FAILED'}:</strong> {currentTest.message}
                                 {currentTest.data && (
                                    <pre className="mt-1 opacity-70 overflow-x-hidden">{JSON.stringify(currentTest.data).slice(0, 50)}...</pre>
                                 )}
                              </div>
                           )}
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleEdit(provider.id)}
                          className="px-4 py-2 bg-[var(--bg-main)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm font-bold rounded-lg transition-colors"
                        >
                          + Connect
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApiConnectionSettings;
