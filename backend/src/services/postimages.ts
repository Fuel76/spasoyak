import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export interface PostImagesResponse {
  status: string;
  uploaded: {
    url: string;
    display_url: string;
    thumb: {
      url: string;
    };
    medium: {
      url: string;
    };
    delete_url: string;
  };
}

export class PostImagesService {
  private static readonly API_URL = 'https://postimages.org/json/rr';
  // Альтернативные endpoints для тестирования
  private static readonly API_URL_ALT = 'https://postimg.cc/json/rr';
  private static readonly API_URL_ALT2 = 'https://postimages.org/api/upload';
  
  /**
   * Загружает изображение на PostImages.org
   * @param filePath Путь к локальному файлу
   * @param fileName Имя файла
   * @returns URL загруженного изображения
   */
  static async uploadImage(filePath: string, fileName: string): Promise<string> {
    try {
      const formData = new FormData();
      
      // Добавляем файл в form data
      formData.append('upload', fs.createReadStream(filePath), {
        filename: fileName,
        contentType: 'image/jpeg' // PostImages автоматически определит тип
      });
      
      // Дополнительные параметры для PostImages API
      formData.append('token', ''); // Можно добавить API токен если есть
      formData.append('gallery', ''); // ID галереи если нужно
      formData.append('adult', 'false'); // Контент не для взрослых
      formData.append('optsize', '0'); // Не изменять размер
      
      const response = await axios.post<PostImagesResponse>(
        PostImagesService.API_URL,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://postimages.org/',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
          },
          timeout: 30000, // 30 секунд таймаут
        }
      );
      
      if (response.data.status === 'OK' && response.data.uploaded) {
        // Возвращаем прямую ссылку на изображение
        return response.data.uploaded.display_url || response.data.uploaded.url;
      } else {
        throw new Error('PostImages API вернул ошибку');
      }
    } catch (error: any) {
      console.error('Ошибка загрузки в PostImages:', error);
      
      if (error.response) {
        throw new Error(`PostImages API ошибка: ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        throw new Error('Нет ответа от PostImages API');
      } else {
        throw new Error(`Ошибка при отправке запроса: ${error.message}`);
      }
    }
  }
  
  /**
   * Загружает изображение из Buffer
   * @param buffer Буфер с данными изображения
   * @param fileName Имя файла
   * @param mimeType MIME тип файла
   * @returns URL загруженного изображения
   */
  static async uploadImageFromBuffer(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      const formData = new FormData();
      
      formData.append('upload', buffer, {
        filename: fileName,
        contentType: mimeType
      });
      
      formData.append('token', '');
      formData.append('gallery', '');
      formData.append('adult', 'false');
      formData.append('optsize', '0');
      
      const response = await axios.post<PostImagesResponse>(
        PostImagesService.API_URL,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'User-Agent': 'Mozilla/5.0 (compatible; MonastyrBot/1.0)',
          },
          timeout: 30000,
        }
      );
      
      if (response.data.status === 'OK' && response.data.uploaded) {
        return response.data.uploaded.display_url || response.data.uploaded.url;
      } else {
        throw new Error('PostImages API вернул ошибку');
      }
    } catch (error: any) {
      console.error('Ошибка загрузки в PostImages:', error);
      throw error;
    }
  }
  
  /**
   * Проверяет, является ли URL ссылкой на PostImages
   * @param url URL для проверки
   * @returns true если это ссылка на PostImages
   */
  static isPostImagesUrl(url: string): boolean {
    return url.includes('postimages.org') || url.includes('postimg.cc');
  }
  
  /**
   * Получает различные размеры изображения из PostImages URL
   * @param url Оригинальный URL
   * @returns Объект с различными размерами
   */
  static getImageSizes(url: string): {
    original: string;
    medium: string;
    thumbnail: string;
  } {
    // PostImages обычно предоставляет разные размеры через изменение пути
    const original = url;
    const medium = url.replace(/(\.[^.]+)$/, '_md$1');
    const thumbnail = url.replace(/(\.[^.]+)$/, '_th$1');
    
    return {
      original,
      medium,
      thumbnail
    };
  }
}
