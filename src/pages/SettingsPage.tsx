import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Shield,
  Server,
  Key,
  Bell,
  Sliders,
  Edit2,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  tenantsApi,
  providersApi,
  integrationsApi,
  usersApi,
} from "@/services/api";
import { getErrorMessage } from "@/lib/utils";
import toast from "react-hot-toast";

type TabType =
  | "tenants"
  | "providers"
  | "integrations"
  | "users"
  | "preferences"
  | "notifications";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("tenants");
  const [loading, setLoading] = useState(false);

  const { activeTenant, setActiveTenant } = useAuthStore();
  const [tenants, setTenants] = useState<any[]>([]);
  const [tenantsError, setTenantsError] = useState<string | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [providersError, setProvidersError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [integrationsError, setIntegrationsError] = useState<string | null>(
    null
  );

  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "analyst",
    tenant_ids: [] as string[],
  });
  const [usersError, setUsersError] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showResolved, setShowResolved] = useState(true);
  const [alertRetention, setAlertRetention] = useState(20);

  const [emailNotif, setEmailNotif] = useState(true);
  const [slackNotif, setSlackNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [notifEmail, setNotifEmail] = useState("soc-team@company");

  const [newTenant, setNewTenant] = useState({
    tenant_name: "",
    siem_tenant_id: "",
    description: "",
  });
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [newProvider, setNewProvider] = useState({
    provider_name: "",
    auth_method: "api_key",
    auth_schema: "{}",
    credential_example: "{}",
    supports_batching: false,
    rate_limit_per_minute: "",
    supported_iocs: ["ip", "domain", "url", "hash"],
  });
  const [editingProviderId, setEditingProviderId] = useState<
    string | number | null
  >(null);

  const [newIntegration, setNewIntegration] = useState({
    provider_id: "",
    credentials: "{}",
    provider_config: "{}",
    priority: 1,
    quota_override: "",
  });
  const [editingIntegrationId, setEditingIntegrationId] = useState<
    string | null
  >(null);

  // removed isDarkMode state

  const loadTenants = async () => {
    try {
      setTenantsError(null);
      const data = await tenantsApi.listTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn("Could not load tenants", err);
      setTenantsError(getErrorMessage(err, "Failed to load tenants."));
      setTenants([]);
    }
  };

  const loadProviders = async () => {
    try {
      setProvidersError(null);
      const data = await providersApi.list(activeTenant);
      setProviders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn("Could not load providers", err);
      if (err.response?.status === 403) {
        setProvidersError(
          "You do not have permission to view or manage global Threat Intel Providers."
        );
      } else {
        setProvidersError(
          getErrorMessage(err, "Failed to load Threat Intel Providers.")
        );
      }
      setProviders([]);
    }
  };

  const loadIntegrations = async () => {
    if (!activeTenant) {
      setIntegrations([]);
      return;
    }
    try {
      setIntegrationsError(null);
      const data = await integrationsApi.listForTenant(activeTenant);
      setIntegrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not load integrations", err);
      setIntegrationsError(
        getErrorMessage(err, "Failed to load active Integrations.")
      );
      setIntegrations([]);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (activeTenant) {
      loadProviders();
    }
  }, [activeTenant]);

  useEffect(() => {
    if (activeTab === "integrations" && activeTenant) {
      loadIntegrations();
    }
    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab, activeTenant]);

  const loadUsers = async () => {
    try {
      setUsersError(null);
      const data = await usersApi.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setUsersError(getErrorMessage(e, "Failed to load users"));
      setUsers([]);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name)
      return toast.error("Missing required fields");
    try {
      setLoading(true);
      await usersApi.create({
        ...newUser,
        tenant_ids: [activeTenant],
      });
      toast.success("User created successfully!");
      setNewUser({
        email: "",
        password: "",
        full_name: "",
        role: "analyst",
        tenant_ids: [],
      });
      loadUsers();
    } catch (e: any) {
      toast.error(
        "Failed to create user: " + getErrorMessage(e, "Check permissions")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateTenant = async () => {
    if (!newTenant.tenant_name || newTenant.tenant_name.length < 3)
      return toast.error("Tenant Name must be at least 3 characters");
    if (!editingTenantId && !newTenant.siem_tenant_id)
      return toast.error("SIEM ID is required for creation");

    const payload: any = {
      tenant_name: newTenant.tenant_name.trim(),
      siem_tenant_id:
        newTenant.siem_tenant_id && newTenant.siem_tenant_id.trim() !== ""
          ? newTenant.siem_tenant_id.trim()
          : null,
    };
    if (newTenant.description && newTenant.description.trim().length >= 5) {
      payload.description = newTenant.description.trim();
    }

    try {
      setLoading(true);
      if (editingTenantId) {
        await tenantsApi.updateConfig(editingTenantId, payload);
        toast.success("Tenant updated!");
      } else {
        await tenantsApi.createTenant(payload);
        toast.success("Tenant created!");
      }
      setNewTenant({ tenant_name: "", siem_tenant_id: "", description: "" });
      setEditingTenantId(null);
      loadTenants();
    } catch (e: any) {
      // apiClient already shows generic 403/401 errors, so we don't need to show them here again
      // unless we want a specific message.
      if (e?.response?.status !== 403 && e?.response?.status !== 401) {
        const msg = getErrorMessage(
          e,
          `Failed to ${editingTenantId ? "update" : "create"} tenant`
        );
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditTenantClick = (t: any) => {
    setEditingTenantId(t.tenant_id || t.id);
    setNewTenant({
      tenant_name: t.tenant_name || t.client_name || "",
      siem_tenant_id: t.siem_tenant_id || "",
      description: t.description || "",
    });
  };

  const handleDeleteTenant = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tenant?")) return;
    try {
      setLoading(true);
      await tenantsApi.deleteTenant(id);
      toast.success("Tenant deleted!");
      loadTenants();
      if (activeTenant === id) {
        setActiveTenant(null);
      }
    } catch (e: any) {
      toast.error(getErrorMessage(e, "Failed to delete tenant"));
      if (e?.response?.status === 403) {
        toast.error(
          "Access Denied: You do not have permissions to delete tenants."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTenantId(null);
    setNewTenant({ tenant_name: "", siem_tenant_id: "", description: "" });
  };

  const handleCreateOrUpdateProvider = async () => {
    if (!newProvider.provider_name && !editingProviderId)
      return toast.error("Provider Name is required.");
    try {
      const schema = JSON.parse(newProvider.auth_schema);
      const credExample = newProvider.credential_example
        ? JSON.parse(newProvider.credential_example)
        : null;
      const rateLimit = newProvider.rate_limit_per_minute
        ? parseInt(newProvider.rate_limit_per_minute, 10)
        : null;

      setLoading(true);
      const payload: any = {
        auth_method: newProvider.auth_method,
        auth_schema: schema,
        credential_example: credExample,
        supports_batching: newProvider.supports_batching,
        rate_limit_per_minute: rateLimit,
        supported_iocs: newProvider.supported_iocs,
      };

      if (editingProviderId) {
        await providersApi.update(editingProviderId, payload);
        toast.success("Provider updated!");
      } else {
        payload.provider_name = newProvider.provider_name;
        await providersApi.create(payload);
        toast.success("Provider created!");
      }
      setNewProvider({
        provider_name: "",
        auth_method: "api_key",
        auth_schema: "{}",
        credential_example: "{}",
        supports_batching: false,
        rate_limit_per_minute: "",
        supported_iocs: ["ip", "domain", "url", "hash"],
      });
      setEditingProviderId(null);
      loadProviders();
    } catch (e: any) {
      toast.error("Invalid JSON or API error: " + getErrorMessage(e, ""));
    } finally {
      setLoading(false);
    }
  };

  const handleEditProviderClick = (p: any) => {
    setEditingProviderId(p.id);
    setNewProvider({
      provider_name: p.provider_name || "",
      auth_method: p.auth_method || "api_key",
      auth_schema: p.auth_schema ? JSON.stringify(p.auth_schema) : "{}",
      credential_example: p.credential_example
        ? JSON.stringify(p.credential_example)
        : "{}",
      supports_batching: p.supports_batching || false,
      rate_limit_per_minute: p.rate_limit_per_minute?.toString() || "",
      supported_iocs: p.supported_iocs || [],
    });
  };

  const handleCancelEditProvider = () => {
    setEditingProviderId(null);
    setNewProvider({
      provider_name: "",
      auth_method: "api_key",
      auth_schema: "{}",
      credential_example: "{}",
      supports_batching: false,
      rate_limit_per_minute: "",
      supported_iocs: ["ip", "domain", "url", "hash"],
    });
  };

  const handleCreateOrUpdateIntegration = async () => {
    if (!activeTenant || (!newIntegration.provider_id && !editingIntegrationId))
      return toast.error("Select tenant and provider");
    try {
      const creds = JSON.parse(newIntegration.credentials);
      const config =
        newIntegration.provider_config &&
        newIntegration.provider_config !== "{}"
          ? JSON.parse(newIntegration.provider_config)
          : null;
      const quota = newIntegration.quota_override
        ? parseInt(newIntegration.quota_override, 10)
        : null;

      setLoading(true);
      const payload: any = {
        credentials: creds,
        provider_config: config,
        priority: newIntegration.priority,
        ...(quota !== null && { quota_override: quota }),
      };

      if (editingIntegrationId) {
        await integrationsApi.update(
          activeTenant,
          editingIntegrationId,
          payload
        );
        toast.success("Integration updated!");
      } else {
        payload.provider_id = parseInt(newIntegration.provider_id, 10);
        await integrationsApi.create(activeTenant, payload);
        toast.success("Integration created!");
      }
      setNewIntegration({
        provider_id: "",
        credentials: "{}",
        provider_config: "{}",
        priority: 1,
        quota_override: "",
      });
      setEditingIntegrationId(null);
      loadIntegrations();
    } catch (e: any) {
      toast.error("Error saving integration: " + getErrorMessage(e, ""));
    } finally {
      setLoading(false);
    }
  };

  const handleEditIntegrationClick = (i: any) => {
    setEditingIntegrationId(i.id);
    setNewIntegration({
      provider_id: i.provider_id?.toString() || "",
      credentials: "{}",
      provider_config: i.provider_config
        ? JSON.stringify(i.provider_config)
        : "{}",
      priority: i.priority || 1,
      quota_override: i.quota_override?.toString() || "",
    });
  };

  const handleCancelEditIntegration = () => {
    setEditingIntegrationId(null);
    setNewIntegration({
      provider_id: "",
      credentials: "{}",
      provider_config: "{}",
      priority: 1,
      quota_override: "",
    });
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
      <div className="card rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-medium text-slate-900">
          {editingTenantId ? "Edit Tenant" : "Create New Tenant"}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Tenant Name * (Min 3 chars)
            </label>
            <input
              className="input"
              placeholder="Client Name"
              value={newTenant.tenant_name}
              onChange={(e) =>
                setNewTenant({ ...newTenant, tenant_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              SIEM Tenant ID (UUID) *
            </label>
            <input
              className="input"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={newTenant.siem_tenant_id}
              onChange={(e) =>
                setNewTenant({ ...newTenant, siem_tenant_id: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Description (Min 5 chars)
            </label>
            <input
              className="input"
              placeholder="Brief description"
              value={newTenant.description}
              onChange={(e) =>
                setNewTenant({ ...newTenant, description: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="mt-4 flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleCreateOrUpdateTenant}
            disabled={loading}
          >
            {editingTenantId ? (
              <>
                <Edit2 className="mr-2 h-4 w-4" /> Update Tenant
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Tenant
              </>
            )}
          </button>
          {editingTenantId && (
            <button
              className="mt-4 flex items-center rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="card bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 overflow-x-auto min-h-[300px] visible">
        {tenantsError ? (
          <div className="border-b border-red-100 bg-red-50 p-8 text-center text-red-600">
            {tenantsError}
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-sm font-medium text-slate-600">Name</th>
                <th className="p-4 text-sm font-medium text-slate-600">ID</th>
                <th className="p-4 text-sm font-medium text-slate-600">
                  Status
                </th>
                <th className="p-4 text-sm font-medium text-slate-600">
                  Created At
                </th>
                <th className="p-4 text-sm font-medium text-slate-600">
                  Updated At
                </th>
                <th className="p-4 text-sm font-medium text-slate-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.tenant_id || t.id}>
                  <td className="p-4 font-medium text-slate-900">
                    {t.tenant_name || t.client_name}
                  </td>
                  <td className="p-4 text-slate-600 text-sm font-mono truncate max-w-[120px] sm:max-w-xs">
                    {t.tenant_id || t.id}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                    {t.is_active ? (
                      <span className="inline-flex rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-semibold text-green-800 dark:text-green-300">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap p-4 text-sm text-slate-600 dark:text-slate-400">
                    {t.created_at
                      ? new Date(t.created_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap p-4 text-sm text-slate-600 dark:text-slate-400">
                    {t.updated_at
                      ? new Date(t.updated_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEditTenantClick(t)}
                      className="mr-2 p-1 text-slate-500 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTenant(t.tenant_id || t.id)}
                      className="p-1 text-slate-500 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderProvidersTab = () => (
    <div className="space-y-6">
      <div className="card rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-medium text-slate-900">
          Create Threat Intel Provider
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Provider Name *
            </label>
            <input
              className="input"
              placeholder="Provider Name"
              value={newProvider.provider_name}
              onChange={(e) =>
                setNewProvider({
                  ...newProvider,
                  provider_name: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Auth Method *
            </label>
            <select
              className="select"
              value={newProvider.auth_method}
              onChange={(e) =>
                setNewProvider({ ...newProvider, auth_method: e.target.value })
              }
            >
              <option value="api_key">API Key</option>
              <option value="oauth2">OAuth 2.0</option>
              <option value="basic">Basic Auth</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Rate Limit Per Min
            </label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 60"
              value={newProvider.rate_limit_per_minute}
              onChange={(e) =>
                setNewProvider({
                  ...newProvider,
                  rate_limit_per_minute: e.target.value,
                })
              }
            />
          </div>
          <div className="col-span-1 space-y-1 md:col-span-2 lg:col-span-3">
            <label className="mb-2 flex cursor-pointer items-center space-x-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={newProvider.supports_batching}
                onChange={(e) =>
                  setNewProvider({
                    ...newProvider,
                    supports_batching: e.target.checked,
                  })
                }
              />
              <span>Supports Batching</span>
            </label>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Supported IoCs *
            </label>
            <div className="flex gap-4">
              {["ip", "domain", "url", "hash"].map((ioc) => (
                <label
                  key={ioc}
                  className="flex cursor-pointer items-center space-x-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={newProvider.supported_iocs.includes(ioc)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewProvider({
                          ...newProvider,
                          supported_iocs: [...newProvider.supported_iocs, ioc],
                        });
                      } else {
                        setNewProvider({
                          ...newProvider,
                          supported_iocs: newProvider.supported_iocs.filter(
                            (v) => v !== ioc
                          ),
                        });
                      }
                    }}
                  />
                  <span>{ioc.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="col-span-1 space-y-1 md:col-span-1 lg:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              Auth Schema (JSON) *
            </label>
            <textarea
              className="input h-20 font-mono text-xs"
              placeholder='{"api_key": "string"}'
              value={newProvider.auth_schema}
              onChange={(e) =>
                setNewProvider({ ...newProvider, auth_schema: e.target.value })
              }
              title="JSON Schema definition"
            />
          </div>
          <div className="col-span-1 space-y-1 md:col-span-1 lg:col-span-1">
            <label className="text-xs font-semibold text-slate-600">
              Credential Example (JSON)
            </label>
            <textarea
              className="input h-20 font-mono text-xs"
              placeholder='{"api_key": "abc..."}'
              value={newProvider.credential_example}
              onChange={(e) =>
                setNewProvider({
                  ...newProvider,
                  credential_example: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="mt-4 flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleCreateOrUpdateProvider}
            disabled={loading}
          >
            {editingProviderId ? (
              <>
                <Edit2 className="mr-2 h-4 w-4" /> Update Provider
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Provider
              </>
            )}
          </button>
          {editingProviderId && (
            <button
              className="mt-4 flex items-center rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              onClick={handleCancelEditProvider}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:bg-slate-900">
        {providersError ? (
          <div className="border-b border-red-100 bg-red-50 p-8 text-center text-red-600">
            {providersError}
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-sm font-medium text-slate-600">ID</th>
                <th className="p-4 text-sm font-medium text-slate-600">Name</th>
                <th className="p-4 text-center text-sm font-medium text-slate-600">
                  Batching
                </th>
                <th className="p-4 text-center text-sm font-medium text-slate-600">
                  Rate Limit
                </th>
                <th className="p-4 text-center text-sm font-medium text-slate-600">
                  IoCs
                </th>
                <th className="p-4 text-sm font-medium text-slate-600">
                  Auth Method
                </th>
                <th className="p-4 text-right text-sm font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {providers.map((p) => (
                <tr key={p.id}>
                  <td className="p-4 font-medium text-slate-900">{p.id}</td>
                  <td className="p-4 font-medium text-slate-900">
                    {p.provider_name}
                  </td>
                  <td className="p-4 text-center text-sm text-slate-600">
                    {p.supports_batching ? (
                      <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                        No
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center font-mono text-sm text-slate-600">
                    {p.rate_limit_per_minute || "-"} /min
                  </td>
                  <td className="p-4 text-center text-sm text-slate-600">
                    {Array.isArray(p.supported_iocs)
                      ? p.supported_iocs.join(", ").toUpperCase()
                      : "-"}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {p.auth_method}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleEditProviderClick(p)}
                      className="mr-2 p-1 text-slate-500 hover:text-slate-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Are you sure?")) return;
                        try {
                          await providersApi.delete(p.id);
                          toast.success("Provider deleted");
                          loadProviders();
                        } catch (e) {
                          toast.error("Failed to delete provider");
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {providers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No providers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Active Tenant Context:
        </span>
        <select
          className="input max-w-sm"
          value={activeTenant || ""}
          onChange={(e) => setActiveTenant(e.target.value)}
        >
          {tenants.map((t) => (
            <option key={t.tenant_id || t.id} value={t.tenant_id || t.id}>
              {t.tenant_name || t.client_name}
            </option>
          ))}
        </select>
      </div>

      <div className="card rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-medium text-slate-900">
          Add Integration for Tenant
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Provider *
            </label>
            <select
              className="select"
              value={newIntegration.provider_id}
              onChange={(e) =>
                setNewIntegration({
                  ...newIntegration,
                  provider_id: e.target.value,
                })
              }
            >
              <option value="">Select Provider...</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.provider_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Priority (1 = Highest)
            </label>
            <input
              type="number"
              className="input"
              placeholder="1"
              value={newIntegration.priority}
              onChange={(e) =>
                setNewIntegration({
                  ...newIntegration,
                  priority: parseInt(e.target.value) || 1,
                })
              }
              min="1"
            />
          </div>
          <div className="col-span-1 space-y-1 md:col-span-2 lg:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              Credentials (JSON) *
            </label>
            {newIntegration.provider_id && (
              <div className="text-[10px] text-slate-500 mb-1">
                Schema:{" "}
                <span className="font-mono">
                  {providers.find(
                    (p) => p.id === parseInt(newIntegration.provider_id)
                  )?.auth_schema
                    ? JSON.stringify(
                        providers.find(
                          (p) => p.id === parseInt(newIntegration.provider_id)
                        )?.auth_schema
                      )
                    : "{}"}
                </span>
              </div>
            )}
            <textarea
              className="input h-24 font-mono text-xs"
              placeholder='{"api_key": "abc..."}'
              value={newIntegration.credentials}
              onChange={(e) =>
                setNewIntegration({
                  ...newIntegration,
                  credentials: e.target.value,
                })
              }
              title="JSON Map of credentials"
            />
          </div>
          <div className="col-span-1 space-y-1 md:col-span-2 lg:col-span-1">
            <label className="text-xs font-semibold text-slate-600">
              Config (JSON)
            </label>
            <div className="text-[10px] text-slate-500 mb-1">
              Schema:{" "}
              <span className="font-mono">{`{"base_url": "...", "alerts_url": "...", "verify": true}`}</span>
            </div>
            <textarea
              className="input h-24 font-mono text-xs"
              placeholder='{"base_url": "..."}'
              value={newIntegration.provider_config}
              onChange={(e) =>
                setNewIntegration({
                  ...newIntegration,
                  provider_config: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="mt-4 flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleCreateOrUpdateIntegration}
            disabled={loading}
          >
            {editingIntegrationId ? (
              <>
                <Edit2 className="mr-2 h-4 w-4" /> Update Integration
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Activate Integration
              </>
            )}
          </button>
          {editingIntegrationId && (
            <button
              className="mt-4 flex items-center rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              onClick={handleCancelEditIntegration}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-visible rounded-lg border border-slate-200 bg-white shadow-sm dark:bg-slate-900">
        {integrationsError ? (
          <div className="border-b border-red-100 bg-red-50 p-8 text-center text-red-600">
            {integrationsError}
          </div>
        ) : (
          <table className="w-full border-collapse overflow-visible text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-sm font-medium text-slate-600">
                  Integration ID
                </th>
                <th className="p-4 text-sm font-medium text-slate-600">
                  Provider Name
                </th>
                <th className="p-4 text-center text-sm font-medium text-slate-600">
                  Priority
                </th>
                <th className="p-4 text-sm font-medium text-slate-600">
                  Status
                </th>
                <th className="p-4 text-right text-sm font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {integrations.map((p) => (
                <tr key={p.id}>
                  <td className="p-4 font-mono text-sm text-slate-600">
                    {p.id}
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    {providers.find((prov) => prov.id === p.provider_id)
                      ?.provider_name || `Provider #${p.provider_id}`}
                  </td>
                  <td className="p-4 text-center text-sm text-slate-600">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 font-medium">
                      {p.priority || 1}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${p.is_active ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400"}`}
                    >
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="flex justify-end p-4 text-right">
                    <button
                      onClick={async () => {
                        if (!activeTenant) return;
                        try {
                          await integrationsApi.update(activeTenant, p.id, {
                            is_active: !p.is_active,
                          });
                          toast.success(
                            `Integration ${p.is_active ? "deactivated" : "activated"}`
                          );
                          loadIntegrations();
                        } catch (e) {
                          toast.error("Failed to toggle status");
                        }
                      }}
                      className="mr-2 p-1 text-slate-500 hover:text-green-600"
                      title={p.is_active ? "Deactivate" : "Activate"}
                    >
                      <Server className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditIntegrationClick(p)}
                      className="mr-2 p-1 text-slate-500 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteIntegration(p.id)}
                      className="p-1 text-slate-500 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {integrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">
                    No active integrations found for this tenant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="card rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-medium text-slate-900">
          Configure SIEM Integration
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Provider Name *
            </label>
            <input
              className="input"
              placeholder="e.g. elasticsearch"
              value={siemTabState.provider_name}
              onChange={(e) =>
                setSiemTabState({
                  ...siemTabState,
                  provider_name: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Auth Type *
            </label>
            <select
              className="select"
              value={siemTabState.auth_type}
              onChange={(e) =>
                setSiemTabState({ ...siemTabState, auth_type: e.target.value })
              }
            >
              <option value="api_key">API Key</option>
              <option value="oauth2">OAuth 2.0</option>
              <option value="basic">Basic</option>
            </select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              Polling Interval (minutes) *
            </label>
            <input
              type="number"
              min="1"
              max="360"
              className="input"
              placeholder="5"
              value={siemTabState.polling_interval}
              onChange={(e) =>
                setSiemTabState({
                  ...siemTabState,
                  polling_interval: parseInt(e.target.value) || 5,
                })
              }
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              Credentials (JSON) *
            </label>
            <textarea
              className="input h-24 font-mono text-xs"
              placeholder='{"api_key": "..."}'
              value={siemTabState.credentials}
              onChange={(e) =>
                setSiemTabState({
                  ...siemTabState,
                  credentials: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-slate-600">
              Provider Config (JSON)
            </label>
            <textarea
              className="input h-24 font-mono text-xs"
              placeholder='{"url": "..."}'
              value={siemTabState.provider_config}
              onChange={(e) =>
                setSiemTabState({
                  ...siemTabState,
                  provider_config: e.target.value,
                })
              }
            />
          </div>
        </div>
        <button
          className="mt-4 flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={handleCreateSiem}
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" /> Save SIEM Config
        </button>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Target Tenant:
        </span>
        <select
          className="input max-w-sm"
          value={activeTenant || ""}
          onChange={(e) => setActiveTenant(e.target.value)}
        >
          {tenants.map((t) => (
            <option key={t.tenant_id || t.id} value={t.tenant_id || t.id}>
              {t.tenant_name || t.client_name}
            </option>
          ))}
        </select>
      </div>

      <div className="card rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-medium text-slate-900">Create User</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Full Name *
            </label>
            <input
              className="input"
              placeholder="John Doe"
              value={newUser.full_name}
              onChange={(e) =>
                setNewUser({ ...newUser, full_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Email *
            </label>
            <input
              type="email"
              className="input"
              placeholder="john@example.com"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Password *
            </label>
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Role *
            </label>
            <select
              className="select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="tenant_admin">Tenant Admin</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>
        </div>
        <button
          className="mt-4 flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={handleCreateUser}
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" /> Add User
        </button>
      </div>

      <div className="card overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:bg-slate-900">
        {usersError ? (
          <div className="border-b border-red-100 bg-red-50 p-8 text-center text-red-600">
            {usersError}
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-sm font-medium text-slate-600">
                  Email
                </th>
                <th className="p-4 text-sm font-medium text-slate-600">Name</th>
                <th className="p-4 text-sm font-medium text-slate-600">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u, i) => (
                <tr key={i}>
                  <td className="p-4 font-medium text-slate-900">{u.email}</td>
                  <td className="p-4 text-sm text-slate-600">{u.full_name}</td>
                  <td className="p-4 text-sm text-slate-600">{u.role}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-500">
                    No users managed or unable to fetch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const [siemTabState, setSiemTabState] = useState({
    provider_name: "",
    auth_type: "api_key",
    credentials: "{}",
    polling_interval: 5,
    provider_config: "{}",
  });

  const handleCreateSiem = async () => {
    if (!activeTenant) return toast.error("Select a tenant first");
    try {
      setLoading(true);
      await tenantsApi.createSiem(activeTenant, {
        tenant_id: activeTenant,
        provider_name: siemTabState.provider_name,
        auth_type: siemTabState.auth_type,
        credentials: JSON.parse(siemTabState.credentials),
        polling_interval: siemTabState.polling_interval,
        provider_config: JSON.parse(siemTabState.provider_config),
      });
      toast.success("SIEM Integration configured successfully");
    } catch (e: any) {
      toast.error("Failed to configure SIEM: " + getErrorMessage(e, ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Administration Settings
        </h1>
        <p className="mt-1 text-slate-600">
          Manage tenants, providers, and integrations across the SOC platform.
        </p>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("tenants")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "tenants" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-slate-100"}`}
          >
            <Server className="mr-2 inline h-4 w-4 align-text-bottom" /> Tenants
          </button>
          <button
            onClick={() => setActiveTab("providers")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "providers" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-slate-100"}`}
          >
            <Shield className="mr-2 inline h-4 w-4 align-text-bottom" />{" "}
            Providers
          </button>
          <button
            onClick={() => setActiveTab("integrations")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "integrations" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-slate-100"}`}
          >
            <Key className="mr-2 inline h-4 w-4 align-text-bottom" />{" "}
            Integrations
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "users" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-slate-100"}`}
          >
            <Shield className="mr-2 inline h-4 w-4 align-text-bottom" /> Users
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "preferences" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-slate-100"}`}
          >
            <Sliders className="mr-2 inline h-4 w-4 align-text-bottom" />{" "}
            Preferences
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "notifications" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-slate-100"}`}
          >
            <Bell className="mr-2 inline h-4 w-4 align-text-bottom" />{" "}
            Notifications
          </button>
        </nav>
      </div>

      <div>
        {activeTab === "tenants" && renderTenantsTab()}
        {activeTab === "providers" && renderProvidersTab()}
        {activeTab === "integrations" && renderIntegrationsTab()}
        {activeTab === "users" && renderUsersTab()}
        {activeTab === "preferences" && (
          <div className="card divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:bg-slate-900">
            <div className="p-6">
              <h3 className="mb-6 text-lg font-medium text-slate-900 dark:text-slate-100">
                Preferences
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Dark mode
                    </div>
                    <div className="text-sm text-slate-500">
                      Use dark theme for the interface
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={darkMode}
                        onChange={(e) => {
                          setDarkMode(e.target.checked);
                          if (e.target.checked)
                            document.documentElement.classList.add("dark");
                          else
                            document.documentElement.classList.remove("dark");
                        }}
                      />
                      <div
                        className={`block w-10 h-6 rounded-full transition-colors ${darkMode ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${darkMode ? "translate-x-4" : ""}`}
                      ></div>
                    </div>
                    <div className="ml-3 text-sm text-slate-700 dark:text-slate-300 min-w-[60px]">
                      {darkMode ? "Enabled" : "Disabled"}
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Auto refresh Dashboard
                    </div>
                    <div className="text-sm text-slate-500">
                      Automatically refresh alert data every 30 seconds
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                      />
                      <div
                        className={`block w-10 h-6 rounded-full transition-colors ${autoRefresh ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${autoRefresh ? "translate-x-4" : ""}`}
                      ></div>
                    </div>
                    <div className="ml-3 text-sm text-slate-700 dark:text-slate-300 min-w-[60px]">
                      {autoRefresh ? "Enabled" : "Disabled"}
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Show resolved alerts
                    </div>
                    <div className="text-sm text-slate-500">
                      Display resolved alerts in the dashboard
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={showResolved}
                        onChange={(e) => setShowResolved(e.target.checked)}
                      />
                      <div
                        className={`block w-10 h-6 rounded-full transition-colors ${showResolved ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${showResolved ? "translate-x-4" : ""}`}
                      ></div>
                    </div>
                    <div className="ml-3 text-sm text-slate-700 dark:text-slate-300 min-w-[60px]">
                      {showResolved ? "Enabled" : "Disabled"}
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="mb-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                      Alert retention period
                    </div>
                    <div className="text-sm text-slate-500">
                      No of days to retain alert history
                    </div>
                  </div>
                  <div>
                    <input
                      type="number"
                      className="input w-20 text-center"
                      value={alertRetention}
                      onChange={(e) =>
                        setAlertRetention(parseInt(e.target.value) || 20)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "notifications" && (
          <div className="card divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:bg-slate-900">
            <div className="p-6">
              <h3 className="mb-6 text-lg font-medium text-slate-900 dark:text-slate-100">
                Notifications
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Email notifications
                    </div>
                    <div className="text-sm text-slate-500">
                      Receive email alerts for critical incidents
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={emailNotif}
                        onChange={(e) => setEmailNotif(e.target.checked)}
                      />
                      <div
                        className={`block w-10 h-6 rounded-full transition-colors ${emailNotif ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${emailNotif ? "translate-x-4" : ""}`}
                      ></div>
                    </div>
                    <div className="ml-3 text-sm text-slate-700 dark:text-slate-300 min-w-[60px]">
                      {emailNotif ? "Enabled" : "Disabled"}
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Slack notifications
                    </div>
                    <div className="text-sm text-slate-500">
                      Send alerts to slack channel
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={slackNotif}
                        onChange={(e) => setSlackNotif(e.target.checked)}
                      />
                      <div
                        className={`block w-10 h-6 rounded-full transition-colors ${slackNotif ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${slackNotif ? "translate-x-4" : ""}`}
                      ></div>
                    </div>
                    <div className="ml-3 text-sm text-slate-700 dark:text-slate-300 min-w-[60px]">
                      {slackNotif ? "Enabled" : "Disabled"}
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      SMS Alerts
                    </div>
                    <div className="text-sm text-slate-500">
                      Receive SMS for P1 critical alerts
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={smsNotif}
                        onChange={(e) => setSmsNotif(e.target.checked)}
                      />
                      <div
                        className={`block w-10 h-6 rounded-full transition-colors ${smsNotif ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${smsNotif ? "translate-x-4" : ""}`}
                      ></div>
                    </div>
                    <div className="ml-3 text-sm text-slate-700 dark:text-slate-300 min-w-[60px]">
                      {smsNotif ? "Enabled" : "Disabled"}
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <div className="mb-2">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Notification email
                    </div>
                    <div className="text-sm text-slate-500">
                      Primary email for receiving notifications
                    </div>
                  </div>
                  <input
                    type="email"
                    className="input max-w-md"
                    value={notifEmail}
                    onChange={(e) => setNotifEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
