import { useEffect, useState } from 'react';
import axios from '../api/axios';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // сначала null
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get('/users/me', { withCredentials: true })
      .then((res) => {
        setUser(res.data);
        setIsAuthenticated(true);
      })
      .catch((err) => {
        console.error('❌ Ошибка при загрузке пользователя:', err);
        setIsAuthenticated(false);
      });
  }, []);

  return { isAuthenticated, user };
};
