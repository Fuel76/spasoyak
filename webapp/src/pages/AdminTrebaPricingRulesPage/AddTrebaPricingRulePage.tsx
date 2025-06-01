import React, { useState } from 'react';

const AddTrebaPricingRulePage = () => {
  const [name, setName] = useState('');
  const [periodValue, setPeriodValue] = useState('Разовое');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [priceType, setPriceType] = useState('PER_NAME');
  const [currency, setCurrency] = useState('RUB');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getAuthHeaders = (): HeadersInit => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const session = localStorage.getItem('session');
    if (session) {
      try {
        const { token } = JSON.parse(session);
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch {}
    }
    return headers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/treba-pricing-rules', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, periodValue, description, price, priceType, currency, isActive })
      });
      if (!res.ok) throw new Error('Ошибка при добавлении правила');
      setMessage('Правило успешно добавлено!');
      setName('');
      setPeriodValue('Разовое');
      setDescription('');
      setPrice(0);
      setPriceType('PER_NAME');
      setCurrency('RUB');
      setIsActive(true);
    } catch (err: any) {
      setError(err.message || 'Ошибка');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2>Добавить правило ценообразования треб</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Название</label>
          <input value={name} onChange={e => setName(e.target.value)} required className="form-control" />
        </div>
        <div>
          <label>Период</label>
          <select value={periodValue} onChange={e => setPeriodValue(e.target.value)} className="form-control">
            <option value="Разовое">Разовое</option>
            <option value="40 дней">40 дней</option>
            <option value="1 год">1 год</option>
            <option value="Псалтирь 1 год">Псалтирь 1 год</option>
          </select>
        </div>
        <div>
          <label>Описание</label>
          <input value={description} onChange={e => setDescription(e.target.value)} className="form-control" />
        </div>
        <div>
          <label>Цена</label>
          <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required className="form-control" />
        </div>
        <div>
          <label>Тип цены</label>
          <select value={priceType} onChange={e => setPriceType(e.target.value)} className="form-control">
            <option value="PER_NAME">За имя</option>
            <option value="PER_TEN_NAMES">За 10 имён</option>
            <option value="FIXED">Фиксированная</option>
          </select>
        </div>
        <div>
          <label>Валюта</label>
          <input value={currency} onChange={e => setCurrency(e.target.value)} className="form-control" />
        </div>
        <div>
          <label>Активно</label>
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>Добавить</button>
      </form>
      {message && <div style={{ color: 'green', marginTop: 12 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
    </div>
  );
};

export default AddTrebaPricingRulePage;
