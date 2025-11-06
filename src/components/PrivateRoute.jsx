import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, clearToken } from '../utils/auth';
import { apiValidate } from '../services/authService';

export default function PrivateRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!isAuthenticated()) {
        setChecking(false);
        setValid(false);
        return;
      }
      try {
        await apiValidate(); // 200 OK = معتبر
        if (mounted) {
          setValid(true);
        }
      } catch (err) {
        clearToken();
        if (mounted) {
          setValid(false);
        }
      } finally {
        if (mounted) setChecking(false);
      }
    };

    run();
    return () => { mounted = false; };
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        در حال بررسی دسترسی...
      </div>
    );
  }

  if (!valid) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
    