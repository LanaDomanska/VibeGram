// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../common/Loader/Loader";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authChecked } = useAuth();
  if (!authChecked) return <Loader />;
  return isAuthenticated ? (children ?? <Outlet />) : <Navigate to="/login" replace />;
}
