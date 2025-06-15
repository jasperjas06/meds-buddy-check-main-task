import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
