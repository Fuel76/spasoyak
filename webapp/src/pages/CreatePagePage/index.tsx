import { useNavigate } from 'react-router-dom';
import { PageEditor } from '../../components/PageEditor/PageEditor';
// Удаляем старый CSS
// import './CreatePagePage.css';

export const CreatePagePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/pages');
  };

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <div className="system-mb-3">
          <button onClick={handleBack} className="system-btn-link">
            ← Вернуться к списку страниц
          </button>
          <h1 className="system-page-title">Создание новой страницы</h1>
        </div>
        
        <PageEditor navigate={navigate} />
      </div>
    </div>
  );
};