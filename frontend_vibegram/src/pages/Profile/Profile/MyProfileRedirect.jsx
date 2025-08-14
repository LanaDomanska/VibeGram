import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function MyProfileRedirect() {
  const { user, authChecked } = useAuth();
  if (!authChecked) return null;           
  return <Navigate to={`/profile/${user?.username}`} replace />;
}
