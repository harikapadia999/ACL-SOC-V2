import React from "react";
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center px-4 min-h-screen bg-slate-50">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-slate-300">404</h1>
          <h2 className="mt-4 mb-2 text-2xl font-bold text-slate-900">
            Page Not Found
          </h2>
          <p className="text-slate-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-3 justify-center sm:flex-row">
          <Link to="/dashboard">
            <Button variant="primary" className="w-full sm:w-auto">
              <Home className="mr-2 w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/alert-triage">
            <Button variant="secondary" className="w-full sm:w-auto">
              <Search className="mr-2 w-4 h-4" />
              View Alerts
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          <p>Need help? Contact support@ai-soc.io</p>
        </div>
      </div>
    </div>
  );
};
