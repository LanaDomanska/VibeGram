// src/components/MyProfileRedirect.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function MyProfileRedirect() {
  const { user, authChecked } = useAuth();
  if (!authChecked) return null;            // ждём проверку
  return <Navigate to={`/profile/${user?.username}`} replace />;
}
