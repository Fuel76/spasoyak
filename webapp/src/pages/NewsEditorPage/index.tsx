import { useParams } from 'react-router-dom';
import { NewsEditor } from '../../components/NewsEditor';

export const NewsEditorPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <NewsEditor newsId={id ? parseInt(id, 10) : undefined} />
    </div>
  );
};