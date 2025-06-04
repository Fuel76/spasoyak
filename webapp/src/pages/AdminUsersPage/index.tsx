import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminUsers.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'banned';
  lastLogin: string;
  createdAt: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'moderator' | 'user'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Моковые данные для демонстрации
      const mockUsers: User[] = [
        {
          id: 1,
          name: 'Иеромонах Серафим',
          email: 'serafim@monastery.ru',
          role: 'admin',
          status: 'active',
          lastLogin: '2024-01-15T10:30:00Z',
          createdAt: '2023-06-01T09:00:00Z'
        },
        {
          id: 2,
          name: 'Иеродиакон Антоний',
          email: 'antoniy@monastery.ru',
          role: 'moderator',
          status: 'active',
          lastLogin: '2024-01-14T15:45:00Z',
          createdAt: '2023-08-15T14:20:00Z'
        },
        {
          id: 3,
          name: 'Александра Петрова',
          email: 'alexandra@example.com',
          role: 'user',
          status: 'active',
          lastLogin: '2024-01-10T12:15:00Z',
          createdAt: '2023-12-01T11:30:00Z'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'moderator': return 'Модератор';
      case 'user': return 'Пользователь';
      default: return role;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'banned': return 'Заблокирован';
      default: return status;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="system-page-container">
        <div className="system-page-content">
          <div className="system-alert system-alert-info">Загрузка пользователей...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div className="admin-users-title">
          <h1>👥 Управление пользователями</h1>
          <p>Администрирование учетных записей и ролей</p>
        </div>
        <div className="admin-users-actions">
          <Link to="/admin" className="admin-btn admin-btn-outline">
            ← Назад в админку
          </Link>
          <button className="admin-btn admin-btn-primary">
            ➕ Добавить пользователя
          </button>
        </div>
      </div>

      <div className="admin-users-controls">
        <div className="users-search">
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="users-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Все
          </button>
          <button
            className={`filter-btn ${filter === 'admin' ? 'active' : ''}`}
            onClick={() => setFilter('admin')}
          >
            Администраторы
          </button>
          <button
            className={`filter-btn ${filter === 'moderator' ? 'active' : ''}`}
            onClick={() => setFilter('moderator')}
          >
            Модераторы
          </button>
          <button
            className={`filter-btn ${filter === 'user' ? 'active' : ''}`}
            onClick={() => setFilter('user')}
          >
            Пользователи
          </button>
        </div>
      </div>

      <div className="users-grid">
        {filteredUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h3 className="user-name">{user.name}</h3>
              <p className="user-email">{user.email}</p>
              <div className="user-meta">
                <span className={`role-badge role-${user.role}`}>
                  {getRoleLabel(user.role)}
                </span>
                <span className={`status-badge status-${user.status}`}>
                  {getStatusLabel(user.status)}
                </span>
              </div>
              <p className="user-last-login">
                Последний вход: {new Date(user.lastLogin).toLocaleDateString()}
              </p>
            </div>
            <div className="user-actions">
              <button className="action-btn edit">✏️</button>
              <button className="action-btn delete">🗑️</button>
              <button className="action-btn settings">⚙️</button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-users">
          <p>Пользователи не найдены</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
