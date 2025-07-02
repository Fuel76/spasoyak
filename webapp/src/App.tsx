import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TrpcProvider } from './lib/trpc';
import './styles/system-pages.css';
import { HomePage } from './pages/HomePage';
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
import CreateNewsPage from './pages/CreateNewsPage';
import { AdminPagesPage } from './pages/AdminPagesPage';
import { CreatePagePage } from './pages/CreatePagePage';
import { EditPagePage } from './pages/EditPagePage';
import { RegisterPage } from './pages/RegisterPage';
import { RegisterAdminPage } from './pages/RegisterAdminPage';
import TrebyPageV2 from './pages/TrebyPageV2';
import AdminTrebyPageV2 from './pages/AdminTrebyPageV2';
import AdminTrebyPaymentsPage from './pages/AdminTrebyPaymentsPage';
import AdminTrebyNotificationsPage from './pages/AdminTrebyNotificationsPage';
import AdminTrebyCalendarPage from './pages/AdminTrebyCalendarPage';
import AdminTrebyTypesPage from './pages/AdminTrebyTypesPage';
import SchedulePage from './pages/SchedulePage';
import AdminSchedulePage from './pages/AdminSchedulePage';
import AboutPage from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { MonasteryHistoryPage } from './pages/AboutPage';
import AdminCalendarPage from './pages/AdminCalendarPage';
import AdminSaintsPage from './pages/AdminSaintsPage';
import AdminReadingsPage from './pages/AdminReadingsPage';
import AdminCalendarDayPage from './pages/AdminCalendarDayPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminTagsPage from './pages/AdminTagsPage';
import AdminUsersPage from './pages/AdminUsersPage/AdminUsersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminMediaPage from './pages/AdminMediaPage';
import AdminBackupsPage from './pages/AdminBackupsPage';

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
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register-admin" element={<RegisterAdminPage />} />
              <Route path="/treby" element={<TrebyPageV2 />} />
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
              <Route path="/admin/treby" element={<PrivateRoute><AdminTrebyPageV2 /></PrivateRoute>} />
              <Route path="/admin/treby/types" element={<PrivateRoute><AdminTrebyTypesPage /></PrivateRoute>} />
              <Route path="/admin/treby/payments" element={<PrivateRoute><AdminTrebyPaymentsPage /></PrivateRoute>} />
              <Route path="/admin/treby/notifications" element={<PrivateRoute><AdminTrebyNotificationsPage /></PrivateRoute>} />
              <Route path="/admin/treby/calendar" element={<PrivateRoute><AdminTrebyCalendarPage /></PrivateRoute>} />
              <Route path="/admin/schedule" element={<PrivateRoute><AdminSchedulePage /></PrivateRoute>} />
              <Route path="/admin/calendar" element={<PrivateRoute><AdminCalendarPage /></PrivateRoute>} />
              <Route path="/admin/calendar/saints" element={<PrivateRoute><AdminSaintsPage /></PrivateRoute>} />
              <Route path="/admin/calendar/readings" element={<PrivateRoute><AdminReadingsPage /></PrivateRoute>} />
              <Route path="/admin/calendar/day/:date" element={<PrivateRoute><AdminCalendarDayPage /></PrivateRoute>} />
              <Route path="/admin/categories" element={<PrivateRoute><AdminCategoriesPage /></PrivateRoute>} />
              <Route path="/admin/tags" element={<PrivateRoute><AdminTagsPage /></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute><AdminUsersPage /></PrivateRoute>} />
              <Route path="/admin/settings" element={<PrivateRoute><AdminSettingsPage /></PrivateRoute>} />
              <Route path="/admin/media" element={<PrivateRoute><AdminMediaPage /></PrivateRoute>} />
              <Route path="/admin/backups" element={<PrivateRoute><AdminBackupsPage /></PrivateRoute>} />
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
