import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import axios from "axios";

export const ApiTestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testDirectConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🧪 Testing DIRECT connection to backend...");
      const url = "https://ai-soc.onrender.com/api/v1/alerts/alerts";
      console.log("📡 URL:", url);

      const response = await axios.get(url, {
        timeout: 60000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Direct connection SUCCESS:", response);
      setResult({
        type: "direct",
        status: response.status,
        statusText: response.statusText,
        dataType: Array.isArray(response.data) ? "array" : typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : "N/A",
        sample: Array.isArray(response.data) ? response.data[0] : response.data,
      });
    } catch (err: any) {
      console.warn("❌ Direct connection FAILED:", err);
      setError(
        `Direct: ${err.message} - ${err.response?.status || "No response"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testProxyConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🧪 Testing PROXY connection...");
      const url = "/api/alerts/alerts";
      console.log("📡 URL:", url);

      const response = await axios.get(url, {
        timeout: 60000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Proxy connection SUCCESS:", response);
      setResult({
        type: "proxy",
        status: response.status,
        statusText: response.statusText,
        dataType: Array.isArray(response.data) ? "array" : typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : "N/A",
        sample: Array.isArray(response.data) ? response.data[0] : response.data,
      });
    } catch (err: any) {
      console.warn("❌ Proxy connection FAILED:", err);
      setError(
        `Proxy: ${err.message} - ${err.response?.status || "No response"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testApiClient = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🧪 Testing API CLIENT...");
      const { alertsApi } = await import("@/services/api");

      const alerts = await alertsApi.getAllAlerts();

      console.log("✅ API Client SUCCESS:", alerts);
      setResult({
        type: "api-client",
        dataType: Array.isArray(alerts) ? "array" : typeof alerts,
        dataLength: Array.isArray(alerts) ? alerts.length : "N/A",
        sample: Array.isArray(alerts) ? alerts[0] : alerts,
      });
    } catch (err: any) {
      console.warn("❌ API Client FAILED:", err);
      setError(`API Client: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          API Connection Test
        </h1>
        <p className="mt-1 text-slate-600">
          Test different connection methods to debug backend integration
        </p>
      </div>

      <div className="space-y-4 card">
        <h2 className="text-lg font-semibold text-slate-900">Test Methods</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Button
            onClick={testDirectConnection}
            disabled={loading}
            className="w-full"
          >
            Test Direct Connection
          </Button>

          <Button
            onClick={testProxyConnection}
            disabled={loading}
            variant="secondary"
            className="w-full"
          >
            Test Proxy Connection
          </Button>

          <Button
            onClick={testApiClient}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Test API Client
          </Button>
        </div>

        <div className="space-y-1 text-sm text-slate-600">
          <p>
            <strong>Direct:</strong>{" "}
            https://ai-soc.onrender.com/api/v1/alerts/alerts
          </p>
          <p>
            <strong>Proxy:</strong> /api/alerts/alerts (via Vite proxy)
          </p>
          <p>
            <strong>API Client:</strong> Uses configured API service
          </p>
        </div>
      </div>

      {loading && (
        <Alert
          type="info"
          title="Testing..."
          message="Please wait while we test the connection..."
        />
      )}

      {error && (
        <Alert type="error" title="Connection Failed" message={error} />
      )}

      {result && (
        <div className="space-y-4 card">
          <h2 className="text-lg font-semibold text-green-600">
            ✅ Connection Successful!
          </h2>

          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <span className="font-medium text-slate-700">Method:</span>
              <span className="px-2 py-1 font-mono text-sm text-blue-800 bg-blue-100 rounded">
                {result.type}
              </span>
            </div>

            {result.status && (
              <div className="flex gap-2 items-center">
                <span className="font-medium text-slate-700">Status:</span>
                <span className="px-2 py-1 font-mono text-sm text-green-800 bg-green-100 rounded">
                  {result.status} {result.statusText}
                </span>
              </div>
            )}

            <div className="flex gap-2 items-center">
              <span className="font-medium text-slate-700">Data Type:</span>
              <span className="px-2 py-1 font-mono text-sm text-purple-800 bg-purple-100 rounded">
                {result.dataType}
              </span>
            </div>

            {result.dataLength !== "N/A" && (
              <div className="flex gap-2 items-center">
                <span className="font-medium text-slate-700">Items:</span>
                <span className="px-2 py-1 font-mono text-sm text-amber-800 bg-amber-100 rounded">
                  {result.dataLength}
                </span>
              </div>
            )}
          </div>

          {result.sample && (
            <div className="mt-4">
              <h3 className="mb-2 font-medium text-slate-700">Sample Data:</h3>
              <pre className="overflow-x-auto p-4 text-xs rounded-lg bg-slate-900 text-slate-100">
                {JSON.stringify(result.sample, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border-blue-200 card">
        <h3 className="mb-2 font-semibold text-blue-900">
          💡 Troubleshooting Tips
        </h3>
        <ul className="space-y-1 text-sm list-disc list-inside text-blue-800">
          <li>
            If <strong>Direct</strong> fails: Backend may have CORS restrictions
          </li>
          <li>
            If <strong>Proxy</strong> works: Use VITE_API_BASE_URL=/api in .env
          </li>
          <li>
            If <strong>API Client</strong> fails: Check
            src/services/api/client.ts configuration
          </li>
          <li>Check browser console (F12) for detailed error messages</li>
          <li>
            Ensure backend is running:
            https://ai-soc.onrender.com/api/v1/alerts/alerts
          </li>
        </ul>
      </div>
    </div>
  );
};
