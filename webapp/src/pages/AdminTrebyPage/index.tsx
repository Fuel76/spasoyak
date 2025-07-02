import { useState, useEffect } from 'react';

interface Treba {
  id: number;
  type: string;
  names: string;
  note?: string;
  paymentStatus: string;
  paymentId?: string;
  createdAt: string;
}

const AdminTrebyPage = () => {
  const [treby, setTreby] = useState<Treba[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/treby')
      .then(res => res.json())
      .then(data => {
        setTreby(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки заявок');
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await fetch(`/api/treby/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status })
      });
      setTreby(treby => treby.map(t => t.id === id ? { ...t, paymentStatus: status } : t));
    } catch {
      alert('Ошибка обновления статуса');
    }
  };

  if (loading) return (
    <div className="system-page-container">
      <div className="system-page-content">
        <div className="system-alert system-alert-info">Загрузка заявок...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="system-page-container">
      <div className="system-page-content">
        <div className="system-alert system-alert-error">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <h1 className="system-page-title">Заявки на требы</h1>
        
        <div className="system-content-card">
          <div className="system-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Тип</th>
                  <th>Имена</th>
                  <th>Записка</th>
                  <th>Дата</th>
                  <th>Статус оплаты</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {treby.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.type}</td>
                    <td style={{whiteSpace:'pre-line'}}>{t.names}</td>
                    <td>{t.note}</td>
                    <td className="system-text-muted system-text-sm">{new Date(t.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`system-badge ${t.paymentStatus === 'paid' ? 'system-badge-success' : 'system-badge-warning'}`}>
                        {t.paymentStatus === 'paid' ? 'Оплачено' : 'В ожидании'}
                      </span>
                    </td>
                    <td>
                      <div className="system-flex-center" style={{ gap: '0.5rem' }}>
                        <button
                          className="system-btn-outline system-btn-sm system-btn-success"
                          disabled={t.paymentStatus === 'paid'}
                          onClick={() => handleStatusChange(t.id, 'paid')}
                        >
                          ✓ Оплачено
                        </button>
                        <button
                          className="system-btn-outline system-btn-sm system-btn-warning"
                          disabled={t.paymentStatus === 'pending'}
                          onClick={() => handleStatusChange(t.id, 'pending')}
                        >
                          ⏳ В ожидании
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTrebyPage;
