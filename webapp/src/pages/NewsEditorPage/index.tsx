import { useParams } from 'react-router-dom';
import { EnhancedNewsEditor } from '../../components/EnhancedNewsEditor';

export const NewsEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const newsId = id ? parseInt(id, 10) : undefined;

  return (
    <div className="news-editor-page">
      <EnhancedNewsEditor 
        newsId={newsId}
        mode={newsId ? 'edit' : 'create'} 
      />
    </div>
  );
};