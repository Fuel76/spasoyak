import React, { useState, useEffect } from 'react';
import { PaymentV2 } from '../../types/treba-v2';
import { PaymentApiV2 } from '../../services/treba-api-v2';
import './AdminTrebyPaymentsPage.css';
import '../../styles/system-pages.css';

const AdminTrebyPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentV2[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await PaymentApiV2.getAll();
      setPayments(response.data);
    } catch (err) {
      setError('Ошибка при загрузке платежей');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: number, status: 'PAID' | 'FAILED' | 'CANCELLED') => {
    try {
      await PaymentApiV2.updateStatus(paymentId, status);
      await loadPayments(); // Перезагружаем список
    } catch (err) {
      setError('Ошибка при обновлении статуса платежа');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID': return 'status-paid';
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-failed';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="loading">Загрузка платежей...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Управление платежами</h1>
        <p>Администрирование платежей по требам</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="payments-list">
        {payments.length === 0 ? (
          <div className="empty-state">
            <p>Платежи не найдены</p>
          </div>
        ) : (
          <div className="payments-table">
            <div className="table-header">
              <div className="table-cell">ID</div>
              <div className="table-cell">Треба ID</div>
              <div className="table-cell">Сумма</div>
              <div className="table-cell">Статус</div>
              <div className="table-cell">Метод</div>
              <div className="table-cell">Создан</div>
              <div className="table-cell">Действия</div>
            </div>
            
            {payments.map((payment) => (
              <div key={payment.id} className="table-row">
                <div className="table-cell">{payment.id}</div>
                <div className="table-cell">{payment.trebaId}</div>
                <div className="table-cell">{payment.amount} {payment.currency}</div>
                <div className="table-cell">
                  <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                <div className="table-cell">{payment.method}</div>
                <div className="table-cell">{formatDate(payment.createdAt)}</div>
                <div className="table-cell">
                  {payment.status === 'PENDING' && (
                    <div className="action-buttons">
                      <button 
                        onClick={() => updatePaymentStatus(payment.id, 'PAID')}
                        className="btn-approve"
                      >
                        Подтвердить
                      </button>
                      <button 
                        onClick={() => updatePaymentStatus(payment.id, 'FAILED')}
                        className="btn-reject"
                      >
                        Отклонить
                      </button>
                    </div>
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

export default AdminTrebyPaymentsPage;
