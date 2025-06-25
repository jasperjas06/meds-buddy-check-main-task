import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Define the context shape
interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
}

// Create context with default null
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("tmm_access_token")
  );
  const [role, setRole] = useState<string | null>(() =>
    localStorage.getItem("tmm_role")
  );

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("tmm_access_token", token);
    } else {
      localStorage.removeItem("tmm_access_token");
    }
  }, [token]);

  // Sync role to localStorage
  useEffect(() => {
    if (role) {
      localStorage.setItem("tmm_role", role);
    } else {
      localStorage.removeItem("tmm_role");
    }
  }, [role]);

  return (
    <AuthContext.Provider value={{ token, setToken, role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
