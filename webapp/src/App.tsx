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

export const App = () => {
  const [pages, setPages] = useState<{ slug: string; title: string; content: string }[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/pages');
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
              {/* Главная страница */}
              <Route index element={<HomePage />} />

              {/* Просмотр новости */}
              <Route path="news/:neww" element={<ViewNewsPage />} />

              {/* Создание страницы */}
              <Route path="create" element={<CreatePage />} />

              {/* Добавление и редактирование новостей */}
              <Route path="news/add" element={<NewsEditorPage />} />
              <Route path="news/edit/:id" element={<NewsEditorPage />} />

              {/* Динамические страницы */}
              {pages.map((page) => (
                <Route
                  key={page.slug}
                  path={page.slug}
                  element={<div dangerouslySetInnerHTML={{ __html: page.content }} />}
                />
              ))}

              {/* Страница авторизации */}
              <Route path="/login" element={<LoginPage />} />

              {/* Страница регистрации пользователя */}
              <Route path="/register" element={<RegisterPage />} />
              {/* Страница регистрации администратора */}
              <Route path="/register-admin" element={<RegisterAdminPage />} />

              {/* Админ страница */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminPage />
                  </PrivateRoute>
                }
              />

              {/* Админ страницы и новости */}
              <Route path="/admin/pages" element={<AdminPagesPage />} />
              <Route path="/admin/pages/create" element={<CreatePagePage />} />
              <Route path="/admin/pages/edit/:id" element={<EditPagePage />} />
              <Route path="/admin/news" element={<NewsList />} />
              <Route path="/admin/sitemap" element={<SiteMapEditor />} />
              <Route path="/admin/news/edit/:id" element={<EditNewsPage />} />
              <Route path="/admin/news/create" element={<CreateNewsPage />} />

              {/* Админ настройка треб */}
              <Route path="/admin/treby" element={<PrivateRoute><AdminTrebyPage /></PrivateRoute>} />
              <Route path="/admin/treby/form-fields" element={<PrivateRoute><AdminTrebaFormFieldsPage /></PrivateRoute>} />
              <Route path="/admin/treby/form-fields/add" element={<PrivateRoute><AddTrebaFormFieldPage /></PrivateRoute>} />
              <Route path="/admin/treby/pricing-rules" element={<PrivateRoute><AdminTrebaPricingRulesPage /></PrivateRoute>} />
              <Route path="/admin/treby/pricing-rules/add" element={<PrivateRoute><AddTrebaPricingRulePage /></PrivateRoute>} />

              {/* Админ расписание богослужений */}
              <Route path="/admin/schedule" element={<PrivateRoute><AdminSchedulePage /></PrivateRoute>} />

              {/* Страница треб */}
              <Route path="treby" element={<TrebyPage />} />

              {/* Страница расписания богослужений */}
              <Route path="/schedule" element={<SchedulePage />} />

              {/* Страница о монастыре */}
              <Route path="/about" element={<AboutPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TrpcProvider>
    </AuthProvider>
  );
};
