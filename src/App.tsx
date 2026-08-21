import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TopPage from './pages/TopPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MeetingPage from './pages/MeetingPage';
import OrganizationPublicPage from './pages/OrganizationPublicPage';

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
        {/*
          画面E（公開ページ）は Layout の外に置く。管理用サイドバーを出さないため。
          プロトタイプに認証は無いので、できるのは「管理画面の枠を外す」ところまで。
        */}
        <Route path="/orgs/:id" element={<OrganizationPublicPage />} />
      </Routes>
    </BrowserRouter>
  );
}
