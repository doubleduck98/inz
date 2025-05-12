/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useState } from 'react';
import { User } from '../types/User';

interface AuthContextType {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
}

interface Props {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const Authorize = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const _user = localStorage.getItem('user');
    if (_user) setUser(JSON.parse(_user));
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error();
  }
  return context;
};
