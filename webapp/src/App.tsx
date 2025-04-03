import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TrpcProvider } from './lib/trpc'
import { HomePage } from './pages/HomePage'
import { ViewNewsPage } from './pages/ViewNewsPage'

// export const App = () => {
//   return <Layout />;
// };
export const App = () => {
  return (
    <TrpcProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news/:neww" element={<ViewNewsPage />} />      
        </Routes>
      </BrowserRouter>
    </TrpcProvider>
  )
}
