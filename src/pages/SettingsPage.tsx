import React, { useState, useEffect } from "react";
import { Plus, Trash2, Shield, Settings, Server, Key, Bell, Sliders } from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { tenantsApi, providersApi, integrationsApi } from '@/services/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

type TabType = "tenants" | "providers" | "integrations" | "notifications" | "preferences";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("tenants");
  const [loading, setLoading] = useState(false);

  const { activeTenant, setActiveTenant } = useAuthStore();
  const [tenants, setTenants] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);

  const [newTenant, setNewTenant] = useState({ tenant_name: "", siem_tenant_id: "", description: "" });
  const [newProvider, setNewProvider] = useState({ 
    provider_name: "", 
    auth_method: "api_key", 
    auth_schema: "{}",
    credential_example: "{}",
    supports_batching: false,
    rate_limit_per_minute: ""
  });
  
  const [newIntegration, setNewIntegration] = useState({ 
    provider_id: "", 
    credentials: "{}",
    provider_config: "{}",
    priority: 1,
    quota_override: ""
  });

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  
  const toggleDarkMode = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    if (newVal) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const loadTenants = async () => {
    try {
      const data = await tenantsApi.listTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not load tenants");
    }
  };

  const loadProviders = async () => {
    try {
      const data = await providersApi.list();
      setProviders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not load providers");
    }
  };

  const loadIntegrations = async () => {
    if (!activeTenant || activeTenant === "00000000-0000-0000-0000-000000000000") {
        setIntegrations([]);
        return;
    }
    try {
      const data = await integrationsApi.listForTenant(activeTenant);
      setIntegrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not load integrations");
      setIntegrations([]);
    }
  };

  useEffect(() => {
    loadTenants();
    loadProviders();
  }, []);

  useEffect(() => {
    if (activeTab === "integrations") {
      loadIntegrations();
    }
  }, [activeTab, activeTenant]);

  const handleCreateTenant = async () => {
    if (!newTenant.tenant_name || !newTenant.siem_tenant_id) return toast.error("Name and SIEM ID required");
    try {
      setLoading(true);
      await tenantsApi.createTenant(newTenant);
      toast.success("Tenant created!");
      setNewTenant({ tenant_name: "", siem_tenant_id: "", description: "" });
      loadTenants();
    } catch (e: any) {
      toast.error(getErrorMessage(e, "Failed to create tenant"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async () => {
    if (!newProvider.provider_name) return toast.error("Provider Name is required.");
    try {
      let schema = JSON.parse(newProvider.auth_schema);
      let credExample = newProvider.credential_example ? JSON.parse(newProvider.credential_example) : null;
      let rateLimit = newProvider.rate_limit_per_minute ? parseInt(newProvider.rate_limit_per_minute, 10) : null;
      
      setLoading(true);
      await providersApi.create({ 
        provider_name: newProvider.provider_name,
        auth_method: newProvider.auth_method,
        auth_schema: schema,
        credential_example: credExample,
        supports_batching: newProvider.supports_batching,
        rate_limit_per_minute: rateLimit
      });
      toast.success("Provider created!");
      setNewProvider({ provider_name: "", auth_method: "api_key", auth_schema: "{}", credential_example: "{}", supports_batching: false, rate_limit_per_minute: "" });
      loadProviders();
    } catch (e: any) {
      toast.error("Invalid JSON or API error: " + getErrorMessage(e, ""));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = async () => {
    if (!activeTenant || !newIntegration.provider_id) return toast.error("Select tenant and provider");
    try {
      let creds = JSON.parse(newIntegration.credentials);
      let config = newIntegration.provider_config && newIntegration.provider_config !== "{}" ? JSON.parse(newIntegration.provider_config) : null;
      let quota = newIntegration.quota_override ? parseInt(newIntegration.quota_override, 10) : null;
      
      setLoading(true);
      await integrationsApi.create(activeTenant, {
        provider_id: parseInt(newIntegration.provider_id, 10),
        credentials: creds,
        provider_config: config,
        priority: newIntegration.priority,
        ...(quota !== null && { quota_override: quota })
      });
      toast.success("Integration created!");
      setNewIntegration({ provider_id: "", credentials: "{}", provider_config: "{}", priority: 1, quota_override: "" });
      loadIntegrations();
    } catch (e: any) {
      toast.error("Error creating integration: " + getErrorMessage(e, ""));
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteIntegration = async (id: string) => {
    if (!activeTenant) return;
    if (!confirm("Are you sure?")) return;
    try {
      await integrationsApi.delete(activeTenant, id);
      toast.success("Integration deleted!");
      loadIntegrations();
    } catch (e: any) {
      toast.error("Error deleting integration");
    }
  };

  const renderTenantsTab = () => (
    <div className="space-y-6">
      <div className="card p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Create New Tenant</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-600">Tenant Name * (Min 3 chars)</label>
             <input className="input" placeholder="Client Name" value={newTenant.tenant_name} onChange={e => setNewTenant({...newTenant, tenant_name: e.target.value})} />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-600">SIEM Tenant ID (UUID) *</label>
             <input className="input" placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" value={newTenant.siem_tenant_id} onChange={e => setNewTenant({...newTenant, siem_tenant_id: e.target.value})} />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-600">Description (Min 5 chars)</label>
             <input className="input" placeholder="Brief description" value={newTenant.description} onChange={e => setNewTenant({...newTenant, description: e.target.value})} />
          </div>
        </div>
        <button className="flex items-center px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50" onClick={handleCreateTenant} disabled={loading}><Plus className="w-4 h-4 mr-2" /> Add Tenant</button>
      </div>

      <div className="card bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-medium text-slate-600">Name</th>
              <th className="p-4 text-sm font-medium text-slate-600">ID</th>
              <th className="p-4 text-sm font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map(t => (
              <tr key={t.tenant_id}>
                <td className="p-4 text-slate-900 font-medium">{t.tenant_name || t.client_name}</td>
                <td className="p-4 text-slate-600 text-sm font-mono">{t.tenant_id || t.id}</td>
                <td className="p-4 text-slate-600 text-sm">
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Active</span>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-slate-500">No tenants found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProvidersTab = () => (
    <div className="space-y-6">
      <div className="card p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Create Threat Intel Provider</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Provider Name *</label>
            <input className="input" placeholder="Provider Name" value={newProvider.provider_name} onChange={e => setNewProvider({...newProvider, provider_name: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Auth Method *</label>
            <select className="select" value={newProvider.auth_method} onChange={e => setNewProvider({...newProvider, auth_method: e.target.value})}>
              <option value="api_key">API Key</option>
              <option value="oauth2">OAuth 2.0</option>
              <option value="basic">Basic Auth</option>
            </select>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-600">Rate Limit Per Min</label>
             <input type="number" className="input" placeholder="e.g. 60" value={newProvider.rate_limit_per_minute} onChange={e => setNewProvider({...newProvider, rate_limit_per_minute: e.target.value})} />
          </div>
          <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
             <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" checked={newProvider.supports_batching} onChange={e => setNewProvider({...newProvider, supports_batching: e.target.checked})} />
                <span>Supports Batching</span>
             </label>
          </div>
          <div className="space-y-1 col-span-1 md:col-span-1 lg:col-span-2">
            <label className="text-xs font-semibold text-slate-600">Auth Schema (JSON) *</label>
            <textarea className="input h-20 font-mono text-xs" placeholder="{&quot;api_key&quot;: &quot;string&quot;}" value={newProvider.auth_schema} onChange={e => setNewProvider({...newProvider, auth_schema: e.target.value})} title="JSON Schema definition" />
          </div>
          <div className="space-y-1 col-span-1 md:col-span-1 lg:col-span-1">
            <label className="text-xs font-semibold text-slate-600">Credential Example (JSON)</label>
            <textarea className="input h-20 font-mono text-xs" placeholder="{&quot;api_key&quot;: &quot;abc...&quot;}" value={newProvider.credential_example} onChange={e => setNewProvider({...newProvider, credential_example: e.target.value})} />
          </div>
        </div>
        <button className="flex items-center px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50" onClick={handleCreateProvider} disabled={loading}><Plus className="w-4 h-4 mr-2" /> Add Provider</button>
      </div>

      <div className="card bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-medium text-slate-600">ID</th>
              <th className="p-4 text-sm font-medium text-slate-600">Name</th>
              <th className="p-4 text-sm font-medium text-slate-600 text-center">Batching</th>
              <th className="p-4 text-sm font-medium text-slate-600 text-center">Rate Limit</th>
              <th className="p-4 text-sm font-medium text-slate-600">Auth Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {providers.map(p => (
              <tr key={p.id}>
                <td className="p-4 text-slate-900 font-medium">{p.id}</td>
                <td className="p-4 text-slate-900 font-medium">{p.provider_name}</td>
                <td className="p-4 text-slate-600 text-sm text-center">
                  {p.supports_batching ? (
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">Yes</span>
                  ) : (
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">No</span>
                  )}
                </td>
                <td className="p-4 text-slate-600 text-sm text-center font-mono">{p.rate_limit_per_minute || '-'} /min</td>
                <td className="p-4 text-slate-600 text-sm">{p.auth_method}</td>
              </tr>
            ))}
            {providers.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-slate-500">No providers found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-200 rounded-lg">
         <span className="font-medium text-slate-700">Active Tenant Context:</span>
         <select
            className="px-3 py-2 border rounded-lg max-w-sm"
            value={activeTenant || ''}
            onChange={(e) => setActiveTenant(e.target.value)}
          >
            {tenants.map(t => (
               <option key={t.tenant_id || t.id} value={t.tenant_id || t.id}>{t.tenant_name || t.client_name}</option>
            ))}
         </select>
      </div>

      <div className="card p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Add Integration for Tenant</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-600">Provider *</label>
             <select className="select" value={newIntegration.provider_id} onChange={e => setNewIntegration({...newIntegration, provider_id: e.target.value})}>
               <option value="">Select Provider...</option>
               {providers.map(p => <option key={p.id} value={p.id}>{p.provider_name}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-600">Priority (1 = Highest)</label>
             <input type="number" className="input" placeholder="1" value={newIntegration.priority} onChange={e => setNewIntegration({...newIntegration, priority: parseInt(e.target.value) || 1})} min="1" />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-600">Quota Override</label>
             <input type="number" className="input" placeholder="Leave empty for default" value={newIntegration.quota_override} onChange={e => setNewIntegration({...newIntegration, quota_override: e.target.value})} />
          </div>
          <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-2">
             <label className="text-xs font-semibold text-slate-600">Credentials (JSON) *</label>
             <textarea className="input h-24 font-mono text-xs" placeholder="{&quot;api_key&quot;: &quot;abc...&quot;}" value={newIntegration.credentials} onChange={e => setNewIntegration({...newIntegration, credentials: e.target.value})} title="JSON Map of credentials" />
          </div>
          <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
             <label className="text-xs font-semibold text-slate-600">Config (JSON)</label>
             <textarea className="input h-24 font-mono text-xs" placeholder="{&quot;base_url&quot;: &quot;...&quot;}" value={newIntegration.provider_config} onChange={e => setNewIntegration({...newIntegration, provider_config: e.target.value})} />
          </div>
        </div>
        <button className="flex items-center px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50" onClick={handleCreateIntegration} disabled={loading}><Plus className="w-4 h-4 mr-2" /> Activate Integration</button>
      </div>

      <div className="card bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-medium text-slate-600">Integration ID</th>
              <th className="p-4 text-sm font-medium text-slate-600">Provider ID</th>
              <th className="p-4 text-sm font-medium text-slate-600 text-center">Priority</th>
              <th className="p-4 text-sm font-medium text-slate-600">Status</th>
              <th className="p-4 text-sm font-medium text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {integrations.map(p => (
              <tr key={p.id}>
                <td className="p-4 text-slate-600 text-sm font-mono">{p.id}</td>
                <td className="p-4 text-slate-900 font-medium">Provider #{p.provider_id}</td>
                <td className="p-4 text-slate-600 text-sm text-center">
                   <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-medium">{p.priority || 1}</span>
                </td>
                <td className="p-4 text-slate-600 text-sm">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDeleteIntegration(p.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {integrations.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-500">No active integrations found for this tenant.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="card p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base text-slate-900">Email notifications</div>
              <div className="text-sm text-slate-500">Receive email alerts for critical incidents</div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0078D4]"></div>
              </label>
              <span className="text-sm text-slate-700 w-16">Enabled</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-base text-slate-900">Slack notifications</div>
              <div className="text-sm text-slate-500">Send alerts to slack channel</div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0078D4]"></div>
              </label>
              <span className="text-sm text-slate-700 w-16">Enabled</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-base text-slate-900">SMS Alerts</div>
              <div className="text-sm text-slate-500">Receive SMS for P1 critical alerts</div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0078D4]"></div>
              </label>
              <span className="text-sm text-slate-700 w-16">Enabled</span>
            </div>
          </div>

          <div className="pt-2">
            <div>
              <div className="text-base text-slate-900">Notification email</div>
              <div className="text-sm text-slate-500 mb-2">Primary email for receiving notifications</div>
            </div>
            <input type="text" defaultValue="soc-team@company" className="w-full max-w-sm px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="card p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base text-slate-900">Dark mode</div>
              <div className="text-sm text-slate-500">Use dark theme for the interface</div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isDarkMode} onChange={toggleDarkMode} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0078D4]"></div>
              </label>
              <span className="text-sm text-slate-700 w-16">{isDarkMode ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base text-slate-900">Auto refresh Dashboard</div>
              <div className="text-sm text-slate-500">Automatically refresh alert data every 30 seconds</div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0078D4]"></div>
              </label>
              <span className="text-sm text-slate-700 w-16">Enabled</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-base text-slate-900">Show resolved alerts</div>
              <div className="text-sm text-slate-500">Display resolved alerts in the dashboard</div>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0078D4]"></div>
              </label>
              <span className="text-sm text-slate-700 w-16">Enabled</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-base text-slate-900">Alert retention period</div>
              <div className="text-sm text-slate-500">No of days to retain alert history</div>
            </div>
            <div className="flex items-center space-x-3 mr-3">
              <input type="number" defaultValue="20" className="w-20 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administration Settings</h1>
        <p className="mt-1 text-slate-600">Manage tenants, providers, and integrations across the SOC platform.</p>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-8">
          <button onClick={() => setActiveTab("tenants")} className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "tenants" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900"}`}>
            <Server className="w-4 h-4 inline mr-2 align-text-bottom" /> Tenants
          </button>
          <button onClick={() => setActiveTab("providers")} className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "providers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900"}`}>
            <Shield className="w-4 h-4 inline mr-2 align-text-bottom" /> Providers
          </button>
          <button onClick={() => setActiveTab("integrations")} className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "integrations" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900"}`}>
            <Key className="w-4 h-4 inline mr-2 align-text-bottom" /> Integrations
          </button>
          <button onClick={() => setActiveTab("notifications")} className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "notifications" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900"}`}>
            <Bell className="w-4 h-4 inline mr-2 align-text-bottom" /> Notifications
          </button>
          <button onClick={() => setActiveTab("preferences")} className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "preferences" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900"}`}>
            <Sliders className="w-4 h-4 inline mr-2 align-text-bottom" /> Preferences
          </button>
        </nav>
      </div>

      <div>
        {activeTab === "tenants" && renderTenantsTab()}
        {activeTab === "providers" && renderProvidersTab()}
        {activeTab === "integrations" && renderIntegrationsTab()}
        {activeTab === "notifications" && renderNotificationsTab()}
        {activeTab === "preferences" && renderPreferencesTab()}
      </div>
    </div>
  );
};
