// AppRoutes.tsx
import { useAuth } from "./context/AuthContext";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";

const AppRoutes = () => {
  const { token } = useAuth();

  return token ? <PrivateRoute /> : <PublicRoute />;
};

export default AppRoutes;
