import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import ComicsPage from './pages/ComicsPage';
import ChaptersPage from './pages/ChaptersPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/comics" replace />} />
          <Route path="/comics" element={<ComicsPage />} />
          <Route path="/comics/:comicId/chapters" element={<ChaptersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
