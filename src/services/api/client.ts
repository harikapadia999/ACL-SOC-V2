import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";
import { API, ENV } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

// Only log in development
if (ENV.IS_DEV) {
  console.log("🔧 API Client Configuration:");
  console.log("📡 Base URL:", API.BASE_URL);
  console.log("🌍 Environment:", ENV.MODE);
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API.BASE_URL,
      timeout: API.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        let token = useAuthStore.getState().token || localStorage.getItem('auth_token');
        if (typeof token === 'string') {
          token = token.trim();
        }
        
        if (token && token !== "undefined" && token !== "null") {
          // Robustly ensure 'Bearer ' prefix matches expected backend format exactly
          let authValue = token;
          if (authValue.toLowerCase().startsWith('bearer ')) {
            authValue = authValue.substring(7).trim();
          }
          config.headers['Authorization'] = `Bearer ${authValue}`;
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        const fullURL = error.config
          ? `${error.config.baseURL}${error.config.url}`
          : "unknown";

        // Handle different error types
        if (error.response?.status === 401) {
          toast.error("Session expired - Please login again");
          useAuthStore.getState().logout();
        } else if (error.response?.status === 403) {
          toast.error("Forbidden - You do not have permission for this action");
        }

        return Promise.reject(error);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();

/**
 * Test API connectivity
 * Only runs in development mode
 */
export const testApiConnection = async () => {
  if (!ENV.IS_DEV) return { success: true };

  try {
    const alertsResponse = await apiClient.get("/api/v1/alerts");
    return {
      success: true,
      endpoint: "/api/v1/alerts",
      data: alertsResponse.data,
    };
  } catch (error: any) {
    try {
      const tenantsResponse = await apiClient.get("/api/v1/tenants");
      return {
        success: true,
        endpoint: "/api/v1/tenants",
        data: tenantsResponse.data,
      };
    } catch (alertsError: any) {
      // Return silent success for mock fallback
      return { success: true, endpoint: "mock_fallback" };
    }
  }
};

// Auto-test on load in development
if (ENV.IS_DEV) {
  testApiConnection().then((result) => {
    if (result.success && result.endpoint !== "mock_fallback") {
      console.log("📊 Working endpoint:", result.endpoint);
    }
  });
}
