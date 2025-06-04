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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const sessionData = localStorage.getItem('session');
      const token = sessionData ? JSON.parse(sessionData).token : null;
      
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const transformedUsers = data.users.map((user: any) => ({
            id: user.id,
            name: user.name || user.email.split('@')[0],
            email: user.email,
            role: user.role,
            status: 'active',
            lastLogin: user.updatedAt,
            createdAt: user.createdAt
          }));
          setUsers(transformedUsers);
        } else {
          console.error('Ошибка при получении пользователей:', data.message);
        }
      } else {
        console.error('Ошибка при запросе пользователей');
      }
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const sessionData = localStorage.getItem('session');
      const token = sessionData ? JSON.parse(sessionData).token : null;
      
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        fetchUsers(); // Обновляем список пользователей
      } else {
        console.error('Ошибка при изменении роли пользователя');
      }
    } catch (error) {
      console.error('Ошибка при изменении роли:', error);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const sessionData = localStorage.getItem('session');
      const token = sessionData ? JSON.parse(sessionData).token : null;
      
      const response = await fetch(`${API_URL}/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchUsers(); // Обновляем список пользователей
      } else {
        console.error('Ошибка при изменении статуса пользователя');
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'moderator': return 'Модератор';
      case 'user': return 'Пользователь';
      default: return role;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'banned': return 'Заблокирован';
      default: return status;
    }
  };

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div className="admin-users-title">
          <h1>Управление пользователями</h1>
          <p>Просмотр и управление пользователями системы</p>
        </div>
        <div className="admin-users-actions">
          <Link to="/admin" className="admin-back-btn">
            ← Назад в админку
          </Link>
        </div>
      </div>

      <div className="admin-users-controls">
        <div className="admin-users-search">
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>
        
        <div className="admin-users-filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="admin-filter-select"
          >
            <option value="all">Все роли</option>
            <option value="admin">Администраторы</option>
            <option value="moderator">Модераторы</option>
            <option value="user">Пользователи</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-users-loading">
          <div className="loading-spinner"></div>
          <p>Загрузка пользователей...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="admin-users-table-container">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Последний вход</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className={`user-row user-${user.status}`}>
                  <td className="user-id">{user.id}</td>
                  <td className="user-name">{user.name}</td>
                  <td className="user-email">{user.email}</td>
                  <td className="user-role">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`role-select role-${user.role}`}
                    >
                      <option value="user">Пользователь</option>
                      <option value="moderator">Модератор</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </td>
                  <td className="user-status">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`status-select status-${user.status}`}
                    >
                      <option value="active">Активен</option>
                      <option value="inactive">Неактивен</option>
                      <option value="banned">Заблокирован</option>
                    </select>
                  </td>
                  <td className="user-last-login">{formatDate(user.lastLogin)}</td>
                  <td className="user-created">{formatDate(user.createdAt)}</td>
                  <td className="user-actions">
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => console.log('Edit user', user.id)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => console.log('Delete user', user.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-users-empty">
          <p>Пользователи не найдены</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
