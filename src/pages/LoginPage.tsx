import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';
import { Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setLoading(true);

    try {
      // 1. Get Access Token
      const resp = await authApi.login({ email, password });
      const token = resp.access_token || resp.token;
      
      if (!token) {
        toast.error("Login failed: No access token received from server.");
        setLoading(false);
        return;
      }

      // 2. Temporarily set token in localStorage so apiClient can use it
      localStorage.setItem('auth_token', token);
      useAuthStore.getState().token = token; // ensure interceptor picks it up immediately

      try {
        // 3. Fetch actual user profile (No more mock fallback)
        const userResp = await authApi.getCurrentUser();
        
        const safeUser = {
           ...userResp,
           email: userResp.email || email,
           full_name: userResp.full_name || userResp.name || email.split('@')[0],
           role: userResp.role || 'analyst',
           tenant_ids: userResp.tenant_ids || ['default']
        };

        // 4. Finalize login
        setAuth(token, safeUser);
        toast.success('Logged in successfully!');
        
        setTimeout(() => {
           navigate('/dashboard');
        }, 100);
      } catch (userErr: any) {
        // If we can't get the user profile, the token is effectively useless or /auth/me is down
        localStorage.removeItem('auth_token');
        useAuthStore.getState().token = null;
        console.warn("Failed to fetch user profile:", userErr);
        toast.error("Failed to load user profile. Check backend.");
      }
    } catch (e: any) {
      console.warn("Login failed:", e);
      toast.error(getErrorMessage(e, 'Login failed'));
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
             <Shield className="text-primary-600 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">AI SOC Access</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in to your dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
               type="email" 
               className="input" 
               placeholder="analyst@example.com" 
               value={email}
               onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
               type="password" 
               className="input" 
               placeholder="••••••••" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary mt-4 w-full py-2.5 text-base"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
