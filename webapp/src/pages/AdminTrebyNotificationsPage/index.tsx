import React, { useState, useEffect } from 'react';
import { NotificationV2 } from '../../types/treba-v2';
import { NotificationApiV2 } from '../../services/treba-api-v2';
import './AdminTrebyNotificationsPage.css';
import '../../styles/system-pages.css';

const AdminTrebyNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationV2[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await NotificationApiV2.getAll();
      setNotifications(response.data);
    } catch (err) {
      setError('Ошибка при загрузке уведомлений');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resendNotification = async (notificationId: number) => {
    try {
      await NotificationApiV2.resend(notificationId);
      await loadNotifications(); // Перезагружаем список
    } catch (err) {
      setError('Ошибка при повторной отправке уведомления');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SENT': return 'status-sent';
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-failed';
      default: return 'status-unknown';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return '📧';
      case 'SMS': return '📱';
      case 'PUSH': return '🔔';
      default: return '📝';
    }
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="loading">Загрузка уведомлений...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Управление уведомлениями</h1>
        <p>Администрирование уведомлений по требам</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>Уведомления не найдены</p>
          </div>
        ) : (
          <div className="notifications-table">
            <div className="table-header">
              <div className="table-cell">ID</div>
              <div className="table-cell">Треба ID</div>
              <div className="table-cell">Тип</div>
              <div className="table-cell">Статус</div>
              <div className="table-cell">Сообщение</div>
              <div className="table-cell">Отправлено</div>
              <div className="table-cell">Действия</div>
            </div>
            
            {notifications.map((notification) => (
              <div key={notification.id} className="table-row">
                <div className="table-cell">{notification.id}</div>
                <div className="table-cell">{notification.trebaId}</div>
                <div className="table-cell">
                  {getTypeIcon(notification.type)} {notification.type}
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${getStatusBadgeClass(notification.status)}`}>
                    {notification.status}
                  </span>
                </div>
                <div className="table-cell message-cell">
                  <div className="message-preview">
                    {notification.message}
                  </div>
                </div>
                <div className="table-cell">
                  {notification.sentAt ? formatDate(notification.sentAt) : '-'}
                </div>
                <div className="table-cell">
                  {notification.status === 'FAILED' && (
                    <button 
                      onClick={() => resendNotification(notification.id)}
                      className="btn-resend"
                    >
                      Отправить повторно
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTrebyNotificationsPage;
