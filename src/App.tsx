import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TopPage from './pages/TopPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MeetingPage from './pages/MeetingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TopPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/meeting" element={<MeetingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
