/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useState } from 'react';
import { User } from '../types/User';
import axios, { AxiosError } from 'axios';
import { UNAUTHORIZED } from '../utils/Events';
import { RefreshResponse } from '@/types/RefreshResponse';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

interface Props {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const Authorize = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const TARGET_URL = import.meta.env.TARGET_URL;

  /**
   * Log out user: invalidate refresh token, remove user object from storage
   * and redirect to login page.
   */
  const logout = async () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user: User = JSON.parse(userString);
      await invalidateToken(user);
    }
    setUser(null);
    localStorage.removeItem('user');
    window.location.replace(`${TARGET_URL}/Account/Logout`);
  };

  /**
   * Performs a call to the server to invalidate user's refresh token.
   */
  const invalidateToken = async (user: User) => {
    const callLogout = async (token: string, refreshToken: string) => {
      const opts = {
        url: 'Auth/Logout',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        data: { token: refreshToken },
      };
      // use axios instance **without** refreshing token (failed call to /auth/logout would
      // result in infinite loop of intercepting 401 -> logout fail -> intercepting 401..)
      await axios.request(opts);
    };

    try {
      await callLogout(user.token, user.refreshToken);
    } catch (e) {
      // handle edge case when trying to call logout with an expired token
      // manually refresh on unsuccessful call, and try again
      if (e instanceof AxiosError && e.response) {
        const error = e as AxiosError;
        if (error.status && error.status !== 401) {
          console.error(e);
          return;
        }

        const opts = {
          url: 'Auth/Refresh',
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          data: { token: user.refreshToken },
        };
        try {
          const { data } = await axios.request<RefreshResponse>(opts);
          await callLogout(data.token, data.refreshToken);
        } catch {
          // if can't refresh here, just return and proceed with logout
          return;
        }
      }
    }
  };

  /**
   * Exchange a cookie returned from login page for a pair of access
   * and refresh token and some user data.
   */
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
      console.error(error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Attempt to load user data from storage. If it's missing try to
   * exchange a login cookie for them.
   */
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        setUser(JSON.parse(userString));
        setLoading(false);
      } catch (e) {
        console.error(e);
        logout();
      }
    } else {
      getToken();
    }
  }, []);

  /**
   * Register an event to log the user out on unauthorized access.
   * For example, the event fires on failure to refresh access token.
   */
  useEffect(() => {
    const handleUnauthorized = () => logout();

    window.addEventListener(UNAUTHORIZED, handleUnauthorized);

    return () => {
      window.removeEventListener(UNAUTHORIZED, handleUnauthorized);
    };
  }, []);

  /**
   * Register an event to watch for changes to the user object in storage.
   * Its purpose is to mainly sync user state between multiple instances of the app.
   */
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'user') return;

      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user: User = JSON.parse(userString);
          setUser(user);
        } catch (e) {
          console.error(e);
          logout();
        }
      } else {
        logout();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
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
