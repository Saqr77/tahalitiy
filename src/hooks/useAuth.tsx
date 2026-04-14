import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, AuthUser } from "@/lib/api";

type AppRole = "patient" | "doctor" | "lab";

interface AuthContextType {
  user: AuthUser | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    if (api.auth.hasToken()) {
      api.auth.getMe()
        .then(({ user: u, role: r }) => {
          setUser(u);
          setRole(r);
        })
        .catch(() => {
          // Token invalid/expired
          api.auth.signOut();
          setUser(null);
          setRole(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    await api.auth.signUp(email, password, fullName, role);
  };

  const signIn = async (email: string, password: string) => {
    const { user: u, role: r } = await api.auth.signIn(email, password);
    setUser(u);
    setRole(r);
  };

  const signOut = async () => {
    await api.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
