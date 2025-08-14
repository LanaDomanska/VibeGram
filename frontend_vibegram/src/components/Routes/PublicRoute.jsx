// src/components/PublicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../common/Loader/Loader";

export default function PublicRoute({ children }) {
  const { isAuthenticated, authChecked } = useAuth();

  if (!authChecked) return <Loader />;

  const firstLogin = localStorage.getItem("firstLogin") === "true";

  if (isAuthenticated && firstLogin) {
    return children ?? <Outlet />; // показываем edit-profile
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />; // все остальные случаи → главная
  }

  return children ?? <Outlet />;
}


