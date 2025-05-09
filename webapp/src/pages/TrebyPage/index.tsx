import React, { useState } from 'react';

const TrebyPage = () => {
  const [type, setType] = useState('о здравии');
  const [names, setNames] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [trebaId, setTrebaId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:3000/api/treby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, names, note })
      });
      if (!res.ok) throw new Error('Ошибка отправки формы');
      const data = await res.json();
      setSuccess(true);
      setNames('');
      setNote('');
      setTrebaId(data.id); // Сохраняем id заявки для оплаты
    } catch (err: any) {
      setError(err.message || 'Ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для оплаты (заглушка)
  const handlePay = async () => {
    if (!trebaId) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/treby/${trebaId}/pay`, { method: 'POST' });
      if (!res.ok) throw new Error('Ошибка создания платежа');
      const data = await res.json();
      setPaymentUrl(data.url);
    } catch (err: any) {
      setError(err.message || 'Ошибка оплаты');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="treby-page container mt-5">
      <h2>Подать записку</h2>
      <form onSubmit={handleSubmit} className="treby-form">
        <div className="form-group mb-3">
          <label>Тип записки:</label>
          <select value={type} onChange={e => setType(e.target.value)} className="form-control">
            <option value="о здравии">О здравии</option>
            <option value="об упокоении">Об упокоении</option>
          </select>
        </div>
        <div className="form-group mb-3">
          <label>Имена (через запятую или с новой строки):</label>
          <textarea
            className="form-control"
            value={names}
            onChange={e => setNames(e.target.value)}
            rows={4}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label>Дополнительная записка (необязательно):</label>
          <input
            className="form-control"
            value={note}
            onChange={e => setNote(e.target.value)}
            type="text"
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Отправка...' : 'Отправить'}
        </button>
        {success && (
          <div className="alert alert-success mt-3">
            Ваша записка отправлена!<br />
            <button className="btn btn-success mt-2" onClick={handlePay} disabled={isLoading || !!paymentUrl}>
              {paymentUrl ? 'Ссылка на оплату сгенерирована' : 'Перейти к оплате'}
            </button>
            {paymentUrl && (
              <div className="mt-2">
                <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">
                  Оплатить
                </a>
              </div>
            )}
          </div>
        )}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
      {/* Здесь будет интеграция оплаты */}
    </div>
  );
};

export default TrebyPage;
