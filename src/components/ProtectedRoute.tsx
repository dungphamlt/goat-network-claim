import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { authService } from "../services/authService";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { address } = useAccount();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");

      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      if (!address) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {
        const result = await authService.verify();
        const isValid =
          result.success &&
          result.data?.address?.toLowerCase() === address.toLowerCase();
        setIsAuthenticated(isValid);

        if (!isValid) {
          Cookies.remove("token");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        Cookies.remove("token");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [address]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary font-medium">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
