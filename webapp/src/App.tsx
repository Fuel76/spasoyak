import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TrpcProvider } from './lib/trpc';
import { HomePage } from './pages/HomePage';
import { ViewNewsPage } from './pages/ViewNewsPage';
import { CreatePage } from './pages/CreatePage';
import { Layout } from './components/layout';
import { NewsEditorPage } from './pages/NewsEditorPage';
import { PrivateRoute } from './components/PrivateRoute';
import AdminPage from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { NewsList } from './pages/AdminPage/NewsList';
import { SiteMapEditor } from './pages/AdminPage/SiteMapEditor';
import { EditNewsPage } from './pages/EditNewsPage';
import { CreateNewsPage } from './pages/CreateNewsPage';
import { AdminPagesPage } from './pages/AdminPagesPage';
import { CreatePagePage } from './pages/CreatePagePage';
import { EditPagePage } from './pages/EditPagePage';
import { RegisterPage } from './pages/RegisterPage';
import { RegisterAdminPage } from './pages/RegisterAdminPage';
import TrebyPage from './pages/TrebyPage';
import AdminTrebyPage from './pages/AdminTrebyPage';
import AdminTrebaFormFieldsPage from './pages/AdminTrebaFormFieldsPage';
import AdminTrebaPricingRulesPage from './pages/AdminTrebaPricingRulesPage';
import AddTrebaFormFieldPage from './pages/AdminTrebaFormFieldsPage/AddTrebaFormFieldPage';
import AddTrebaPricingRulePage from './pages/AdminTrebaPricingRulesPage/AddTrebaPricingRulePage';
import SchedulePage from './pages/SchedulePage';
import AdminSchedulePage from './pages/AdminSchedulePage';
import AboutPage from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MonasteryHistoryPage } from './pages/AboutPage';

export const App = () => {
  const [pages, setPages] = useState<{ slug: string; title: string; content: string }[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/pages');
        if (!response.ok) {
          throw new Error('Ошибка при загрузке страниц');
        }
        const data = await response.json();
        setPages(data);
      } catch (error) {
        console.error('Ошибка при загрузке страниц:', error);
      }
    };

    fetchPages();
  }, []);

  return (
    <AuthProvider>
      <TrpcProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="/news/:id" element={<ViewNewsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register-admin" element={<RegisterAdminPage />} />
              <Route path="/treby" element={<TrebyPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/monastery-history" element={<MonasteryHistoryPage />} />
              
              {/* Защищенные административные роуты */}
              <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
              <Route path="/admin/news" element={<PrivateRoute><NewsList /></PrivateRoute>} />
              <Route path="/admin/news/create" element={<PrivateRoute><CreateNewsPage /></PrivateRoute>} />
              <Route path="/admin/news/edit/:id" element={<PrivateRoute><EditNewsPage /></PrivateRoute>} />
              <Route path="/admin/pages" element={<PrivateRoute><AdminPagesPage /></PrivateRoute>} />
              <Route path="/admin/pages/create" element={<PrivateRoute><CreatePagePage /></PrivateRoute>} />
              <Route path="/admin/pages/edit/:id" element={<PrivateRoute><EditPagePage /></PrivateRoute>} />
              <Route path="/admin/sitemap" element={<PrivateRoute><SiteMapEditor /></PrivateRoute>} />
              <Route path="/admin/treby" element={<PrivateRoute><AdminTrebyPage /></PrivateRoute>} />
              <Route path="/admin/treby/form-fields" element={<PrivateRoute><AdminTrebaFormFieldsPage /></PrivateRoute>} />
              <Route path="/admin/treby/form-fields/add" element={<PrivateRoute><AddTrebaFormFieldPage /></PrivateRoute>} />
              <Route path="/admin/treby/pricing-rules" element={<PrivateRoute><AdminTrebaPricingRulesPage /></PrivateRoute>} />
              <Route path="/admin/treby/pricing-rules/add" element={<PrivateRoute><AddTrebaPricingRulePage /></PrivateRoute>} />
              <Route path="/admin/schedule" element={<PrivateRoute><AdminSchedulePage /></PrivateRoute>} />
              <Route path="/news/add" element={<PrivateRoute><NewsEditorPage /></PrivateRoute>} />
              <Route path="/create-page" element={<PrivateRoute><CreatePage /></PrivateRoute>} />
              
              {/* Динамические роуты для страниц */}
              {pages.map((page) => (
                <Route
                  key={page.slug}
                  path={`/${page.slug}`}
                  element={
                    <div 
                      className="page-content" 
                      dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                  }
                />
              ))}
              
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TrpcProvider>
    </AuthProvider>
  );
};
