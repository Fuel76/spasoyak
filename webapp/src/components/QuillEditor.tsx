import React, { useState, Component, ErrorInfo } from 'react';
import QuillWrapper from './QuillWrapper';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Что-то пошло не так.</h2>;
    }

    return this.props.children;
  }
}

export const QuillEditor = () => {
  const [content, setContent] = useState<string>('');

  const handleEditorChange = (value: string) => {
    setContent(value);
    console.log('Content:', value);
  };

  return (
    <ErrorBoundary>
      <div>
        <h2>Редактор контента</h2>
        <QuillWrapper
          value={content}
          onChange={handleEditorChange}
          theme="snow"
          placeholder="Введите ваш контент здесь..."
        />
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Предпросмотр:</h3>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </ErrorBoundary>
  );
};