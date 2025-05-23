import React, { useEffect, useState } from 'react';
import AddTrebaPricingRulePage from './AddTrebaPricingRulePage';

interface TrebaPricingRule {
  id: number;
  name: string;
  periodValue: string;
  description?: string;
  price: number;
  priceType: string;
  currency: string;
  isActive: boolean;
}

const AdminTrebaPricingRulesPage = () => {
  const [rules, setRules] = useState<TrebaPricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/treba-pricing-rules')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRules(data);
        } else {
          setError('Ошибка: получен неверный формат данных');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки правил ценообразования');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Настройка правил ценообразования треб</h2>
      <a href="/admin/treby/pricing-rules/add" className="btn btn-success" style={{ marginBottom: 16, display: 'inline-block' }}>Добавить правило</a>
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Период</th>
              <th>Описание</th>
              <th>Цена</th>
              <th>Тип цены</th>
              <th>Валюта</th>
              <th>Активно</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.id}>
                <td>{rule.id}</td>
                <td>{rule.name}</td>
                <td>{rule.periodValue}</td>
                <td>{rule.description || ''}</td>
                <td>{rule.price}</td>
                <td>{rule.priceType}</td>
                <td>{rule.currency}</td>
                <td>{rule.isActive ? 'Да' : 'Нет'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTrebaPricingRulesPage;
