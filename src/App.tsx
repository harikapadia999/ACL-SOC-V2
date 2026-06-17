import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { UI } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

// Lazy load pages for code splitting
const LoginPage = lazy(() => import("@/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const AlertsPage = lazy(() =>
  import("@/pages/AlertsPage").then((m) => ({ default: m.AlertsPage }))
);
const AlertDetailPage = lazy(() =>
  import("@/pages/AlertDetailPage").then((m) => ({
    default: m.AlertDetailPage,
  }))
);
const AlertTriageListPage = lazy(() =>
  import("@/pages/AlertTriageListPage").then((m) => ({
    default: m.AlertTriageListPage,
  }))
);
const AlertTriageDetailPage = lazy(() =>
  import("@/pages/AlertTriageDetailPage").then((m) => ({
    default: m.AlertTriageDetailPage,
  }))
);
const InvestigatePage = lazy(() =>
  import("@/pages/InvestigatePage").then((m) => ({
    default: m.InvestigatePage,
  }))
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const ApiTestPage = lazy(() =>
  import("@/pages/ApiTestPage").then((m) => ({ default: m.ApiTestPage }))
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="flex flex-col gap-4 items-center">
      <div className="w-12 h-12 rounded-full border-4 border-blue-600 animate-spin border-t-transparent" />
      <p className="text-sm text-slate-600">Loading...</p>
    </div>
  </div>
);

const AuthRoute = () => {
  const { token } = useAuthStore();
  console.log("AuthRoute rendered. Token is:", token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: UI.TOAST_DURATION,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: UI.TOAST_SUCCESS_DURATION,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: UI.TOAST_ERROR_DURATION,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AuthRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/alerts/:alertId" element={<AlertDetailPage />} />
              <Route path="/alert-triage" element={<AlertTriageListPage />} />
              <Route
                path="/alert-triage/:alertId"
                element={<AlertTriageDetailPage />}
              />
              <Route path="/investigate" element={<InvestigatePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/api-test" element={<ApiTestPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
