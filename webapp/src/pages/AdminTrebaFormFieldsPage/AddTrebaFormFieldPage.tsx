import React, { useState } from 'react';

const AddTrebaFormFieldPage = () => {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('TEXT');
  const [label, setLabel] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [order, setOrder] = useState(0);
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
      const res = await fetch('http://localhost:3000/api/treba-form-fields', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ fieldName, fieldType, label, isRequired, order, isActive })
      });
      if (!res.ok) throw new Error('Ошибка при добавлении поля');
      setMessage('Поле успешно добавлено!');
      setFieldName('');
      setLabel('');
      setIsRequired(false);
      setOrder(0);
      setIsActive(true);
    } catch (err: any) {
      setError(err.message || 'Ошибка');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>Добавить поле формы треб</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Название поля</label>
          <input value={fieldName} onChange={e => setFieldName(e.target.value)} required className="form-control" />
        </div>
        <div>
          <label>Тип поля</label>
          <select value={fieldType} onChange={e => setFieldType(e.target.value)} className="form-control">
            <option value="TEXT">Текст</option>
            <option value="TEXTAREA">Многострочный текст</option>
            <option value="SELECT">Выпадающий список</option>
            <option value="RADIO">Радио-кнопки</option>
            <option value="CHECKBOX">Чекбокс</option>
            <option value="NUMBER">Число</option>
          </select>
        </div>
        <div>
          <label>Метка</label>
          <input value={label} onChange={e => setLabel(e.target.value)} required className="form-control" />
        </div>
        <div>
          <label>Обязательное</label>
          <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} />
        </div>
        <div>
          <label>Порядок</label>
          <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="form-control" />
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

export default AddTrebaFormFieldPage;
