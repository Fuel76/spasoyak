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
    fetch('http://localhost:3000/api/treby')
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
      await fetch(`http://localhost:3000/api/treby/${id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status })
      });
      setTreby(treby => treby.map(t => t.id === id ? { ...t, paymentStatus: status } : t));
    } catch {
      alert('Ошибка обновления статуса');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <h2>Заявки на требы</h2>
      <table className="table table-bordered">
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
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>{t.paymentStatus}</td>
              <td>
                <button
                  className="btn btn-success btn-sm me-2"
                  disabled={t.paymentStatus === 'paid'}
                  onClick={() => handleStatusChange(t.id, 'paid')}
                >Отметить как оплачено</button>
                <button
                  className="btn btn-warning btn-sm"
                  disabled={t.paymentStatus === 'pending'}
                  onClick={() => handleStatusChange(t.id, 'pending')}
                >В ожидании</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTrebyPage;
