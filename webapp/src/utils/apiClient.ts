import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Базовый URL API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Класс для работы с API
 */
class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    // Создаем экземпляр axios с базовыми настройками
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Загружаем токен из localStorage при инициализации
    this.loadToken();

    // Добавляем перехватчики запросов
    this.setupInterceptors();
  }

  /**
   * Загружает токен из localStorage
   */
  private loadToken(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.token = token;
    }
  }

  /**
   * Сохраняет токен в localStorage
   * @param token JWT токен
   */
  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  /**
   * Удаляет токен (при выходе из системы)
   */
  public clearToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  /**
   * Получает токен авторизации
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * Настраивает перехватчики запросов
   */
  private setupInterceptors(): void {
    // Перехватчик запросов - добавляет токен авторизации, если он есть
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Перехватчик ответов - обрабатывает ошибки и т.д.
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Если сервер вернул 401 (неавторизован), то удаляем токен
        if (error.response && error.response.status === 401) {
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Выполняет GET запрос
   * @param url URL для запроса
   * @param config Конфигурация запроса
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * Выполняет POST запрос
   * @param url URL для запроса
   * @param data Данные для отправки
   * @param config Конфигурация запроса
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Выполняет PUT запрос
   * @param url URL для запроса
   * @param data Данные для отправки
   * @param config Конфигурация запроса
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Выполняет PATCH запрос
   * @param url URL для запроса
   * @param data Данные для отправки
   * @param config Конфигурация запроса
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Выполняет DELETE запрос
   * @param url URL для запроса
   * @param config Конфигурация запроса
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Загружает файл
   * @param url URL для запроса
   * @param file Файл для загрузки
   * @param fieldName Имя поля формы
   * @param onProgress Колбэк для отслеживания прогресса загрузки
   */
  public async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName = 'file',
    onProgress?: (percentage: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await this.axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    });

    return response.data;
  }
}

// Экспортируем экземпляр класса для использования в приложении
export const apiClient = new ApiClient();
