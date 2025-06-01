import { useEffect, useState } from 'react';

interface TrebaFormField {
  id: number;
  fieldName: string;
  fieldType: string;
  label: string;
  isRequired: boolean;
  order: number;
  isActive: boolean;
}

const AdminTrebaFormFieldsPage = () => {
  const [fields, setFields] = useState<TrebaFormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/treba-form-fields')
      .then(res => res.json())
      .then(data => {
        setFields(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки полей формы');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Настройка полей формы треб</h2>
      <a href="/admin/treby/form-fields/add" className="btn btn-success" style={{ marginBottom: 16, display: 'inline-block' }}>Добавить поле</a>
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название поля</th>
            <th>Тип</th>
            <th>Метка</th>
            <th>Обязательное</th>
            <th>Порядок</th>
            <th>Активно</th>
          </tr>
        </thead>
        <tbody>
          {fields.map(field => (
            <tr key={field.id}>
              <td>{field.id}</td>
              <td>{field.fieldName}</td>
              <td>{field.fieldType}</td>
              <td>{field.label}</td>
              <td>{field.isRequired ? 'Да' : 'Нет'}</td>
              <td>{field.order}</td>
              <td>{field.isActive ? 'Да' : 'Нет'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Здесь можно добавить кнопки для создания/редактирования/удаления */}
    </div>
  );
};

export default AdminTrebaFormFieldsPage;
