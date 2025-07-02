import React, { useState, useEffect } from 'react';
import './AdminBackups.css';

interface BackupFile {
  id: string;
  name: string;
  size: number;
  date: string;
  type: 'full' | 'partial';
  status: 'completed' | 'in_progress' | 'failed';
}

// Функция для получения токена авторизации
const getAuthToken = (): string | null => {
  const sessionData = localStorage.getItem('session');
  return sessionData ? JSON.parse(sessionData).token : null;
};

const AdminBackupsPage: React.FC = () => {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backup', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      } else {
        // Fallback к мокапам если API недоступно
        const mockBackups: BackupFile[] = [
          {
            id: '1',
            name: 'backup_2024_01_15_full.zip',
            size: 156789432,
            date: '2024-01-15T10:30:00Z',
            type: 'full',
            status: 'completed'
          },
          {
            id: '2',
            name: 'backup_2024_01_14_partial.zip',
            size: 45123456,
            date: '2024-01-14T18:20:00Z',
            type: 'partial',
            status: 'completed'
          },
          {
            id: '3',
            name: 'backup_2024_01_13_full.zip',
            size: 178654321,
            date: '2024-01-13T02:15:00Z',
            type: 'full',
            status: 'completed'
          },
          {
            id: '4',
            name: 'backup_2024_01_12_partial.zip',
            size: 0,
            date: '2024-01-12T14:45:00Z',
            type: 'partial',
            status: 'failed'
          }
        ];
        setBackups(mockBackups);
        showNotification('Используются тестовые данные резервных копий', 'error');
      }
    } catch (error) {
      console.error('Ошибка загрузки резервных копий:', error);
      // Fallback к мокапам при ошибке
      const mockBackups: BackupFile[] = [
        {
          id: '1',
          name: 'backup_2024_01_15_full.zip',
          size: 156789432,
          date: '2024-01-15T10:30:00Z',
          type: 'full',
          status: 'completed'
        }
      ];
      setBackups(mockBackups);
      showNotification('Ошибка при загрузке резервных копий. Используются тестовые данные.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (type: 'full' | 'partial') => {
    setCreating(true);
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        showNotification('Резервная копия успешно создана', 'success');
        loadBackups(); // Перезагружаем список
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка создания резервной копии');
      }
    } catch (error) {
      console.error('Ошибка создания резервной копии:', error);
      showNotification(`Ошибка при создании резервной копии: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, 'error');
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (backup: BackupFile) => {
    try {
      const response = await fetch(`/api/backup/download/${backup.name}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = backup.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showNotification('Скачивание началось', 'success');
      } else {
        throw new Error('Ошибка скачивания файла');
      }
    } catch (error) {
      console.error('Ошибка скачивания:', error);
      showNotification('Ошибка при скачивании файла', 'error');
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту резервную копию?')) {
      return;
    }

    try {
      const response = await fetch(`/api/backup/${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        setBackups(prev => prev.filter(backup => backup.id !== backupId));
        showNotification('Резервная копия удалена', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка удаления файла');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      showNotification(`Ошибка при удалении резервной копии: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'in_progress':
        return 'В процессе';
      case 'failed':
        return 'Ошибка';
      default:
        return 'Неизвестно';
    }
  };

  const getTypeText = (type: string) => {
    return type === 'full' ? 'Полная' : 'Частичная';
  };

  return (
    <div className="admin-backups-page">
      <div className="admin-backups-header">
        <h1>Резервные копии</h1>
        <p>Управление резервными копиями системы</p>
      </div>

      <div className="backups-content">
        <div className="backup-actions">
          <div className="action-card">
            <div className="action-icon">💾</div>
            <div className="action-info">
              <h3>Полная резервная копия</h3>
              <p>Создает полную копию всех данных системы</p>
            </div>
            <button 
              className="action-button primary"
              onClick={() => createBackup('full')}
              disabled={creating}
            >
              {creating ? 'Создание...' : 'Создать'}
            </button>
          </div>

          <div className="action-card">
            <div className="action-icon">📁</div>
            <div className="action-info">
              <h3>Частичная резервная копия</h3>
              <p>Создает копию только измененных данных</p>
            </div>
            <button 
              className="action-button secondary"
              onClick={() => createBackup('partial')}
              disabled={creating}
            >
              {creating ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </div>

        {creating && (
          <div className="backup-progress">
            <div className="progress-content">
              <div className="progress-spinner"></div>
              <div className="progress-text">
                <h4>Создание резервной копии...</h4>
                <p>Пожалуйста, подождите. Это может занять несколько минут.</p>
              </div>
            </div>
          </div>
        )}

        <div className="backups-list">
          <div className="list-header">
            <h2>Существующие резервные копии</h2>
            <div className="list-stats">
              Всего: {backups.length} копий
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Загрузка резервных копий...</span>
            </div>
          ) : backups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-text">Резервные копии не найдены</div>
              <div className="empty-hint">Создайте первую резервную копию</div>
            </div>
          ) : (
            <div className="backup-grid">
              {backups.map(backup => (
                <div key={backup.id} className={`backup-item ${backup.status}`}>
                  <div className="backup-header">
                    <div className="backup-name">{backup.name}</div>
                    <div className={`backup-status ${backup.status}`}>
                      <span className="status-icon">{getStatusIcon(backup.status)}</span>
                      <span className="status-text">{getStatusText(backup.status)}</span>
                    </div>
                  </div>
                  
                  <div className="backup-details">
                    <div className="detail-item">
                      <span className="detail-label">Тип:</span>
                      <span className={`detail-value type-${backup.type}`}>
                        {getTypeText(backup.type)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Размер:</span>
                      <span className="detail-value">{formatFileSize(backup.size)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Дата:</span>
                      <span className="detail-value">{formatDate(backup.date)}</span>
                    </div>
                  </div>

                  {backup.status === 'completed' && (
                    <div className="backup-actions">
                      <button 
                        className="action-btn download"
                        onClick={() => downloadBackup(backup)}
                        title="Скачать"
                      >
                        ⬇️ Скачать
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => deleteBackup(backup.id)}
                        title="Удалить"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AdminBackupsPage;
