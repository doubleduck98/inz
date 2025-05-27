/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useState } from 'react';
import { User } from '../types/User';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.replace('https://localhost:7258/Account/Logout');
  };

  const getToken = async () => {
    try {
      const opts = {
        url: 'Auth/GetToken',
        method: 'Get',
        headers: { 'content-type': 'application/json' },
        withCredentials: true,
      };

      const { data } = await axios.request(opts);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.log(error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const _user = localStorage.getItem('user');
    if (_user) {
      try {
        setUser(JSON.parse(_user));
        setLoading(false);
      } catch (e) {
        console.log(e);
        localStorage.removeItem('user');
        getToken();
      }
    } else {
      getToken();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
