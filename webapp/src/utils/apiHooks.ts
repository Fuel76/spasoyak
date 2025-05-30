import { useState, useEffect, useCallback } from 'react';
import { apiClient } from './apiClient';

/**
 * Интерфейс для опций useFetch и useApi
 */
interface ApiOptions<T> {
  initialData?: T;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

/**
 * Хук для выполнения GET запроса при монтировании компонента
 * @param url URL для GET запроса
 * @param options Опции для запроса
 * @returns Объект с данными, ошибкой, состоянием загрузки и функцией для повторного запроса
 */
export function useFetch<T>(url: string, options: ApiOptions<T> = {}) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<T>(url);
      setData(response);
      options.onSuccess?.(response);
    } catch (err) {
      setError(err);
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [url, ...(options.dependencies || [])]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}

/**
 * Хук для выполнения произвольных API запросов
 * @returns Объект с методами для работы с API и состоянием запроса
 */
export function useApi<T = any>(options: ApiOptions<T> = {}) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // GET запрос
  const get = useCallback(async (url: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get<T>(url);
      setData(response);
      options.onSuccess?.(response);
      return response;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [...(options.dependencies || [])]);

  // POST запрос
  const post = useCallback(async (url: string, data?: any) => {
    setLoading(true);
    try {
      const response = await apiClient.post<T>(url, data);
      setData(response);
      options.onSuccess?.(response);
      return response;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [...(options.dependencies || [])]);

  // PUT запрос
  const put = useCallback(async (url: string, data?: any) => {
    setLoading(true);
    try {
      const response = await apiClient.put<T>(url, data);
      setData(response);
      options.onSuccess?.(response);
      return response;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [...(options.dependencies || [])]);

  // PATCH запрос
  const patch = useCallback(async (url: string, data?: any) => {
    setLoading(true);
    try {
      const response = await apiClient.patch<T>(url, data);
      setData(response);
      options.onSuccess?.(response);
      return response;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [...(options.dependencies || [])]);

  // DELETE запрос
  const remove = useCallback(async (url: string) => {
    setLoading(true);
    try {
      const response = await apiClient.delete<T>(url);
      setData(response);
      options.onSuccess?.(response);
      return response;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [...(options.dependencies || [])]);

  // Загрузка файла
  const uploadFile = useCallback(async (url: string, file: File, fieldName = 'file', onProgress?: (percentage: number) => void) => {
    setLoading(true);
    try {
      const response = await apiClient.uploadFile<T>(url, file, fieldName, onProgress);
      setData(response);
      options.onSuccess?.(response);
      return response;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [...(options.dependencies || [])]);

  return {
    data,
    error,
    loading,
    get,
    post,
    put,
    patch,
    remove,
    uploadFile,
  };
}

/**
 * Хук для аутентификации пользователя
 * @returns Объект с методами и состоянием аутентификации
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!apiClient.getToken());
  const [loading, setLoading] = useState<boolean>(true);

  const api = useApi({
    onError: (error) => console.error('Auth API error:', error),
  });

  // Загрузка данных пользователя при монтировании компонента
  useEffect(() => {
    if (apiClient.getToken()) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Загрузка данных текущего пользователя
   */
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      if (response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Вход в систему
   * @param email Email пользователя
   * @param password Пароль пользователя
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response?.token && response?.user) {
        apiClient.setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return response.user;
      }
      throw new Error('Неверный ответ от сервера');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Регистрация нового пользователя
   * @param email Email пользователя
   * @param password Пароль пользователя
   * @param name Имя пользователя
   */
  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, name });
      if (response?.token && response?.user) {
        apiClient.setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return response.user;
      }
      throw new Error('Неверный ответ от сервера');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Выход из системы
   */
  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Проверка, является ли пользователь администратором
   */
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return {
    user,
    isAuthenticated,
    isAdmin: isAdmin(),
    loading,
    login,
    register,
    logout,
    refreshUser: fetchCurrentUser
  };
}
