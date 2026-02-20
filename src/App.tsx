import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import AttributeListPage from './components/attributes/AttributeListPage';
import UserListPage from './components/users/UserListPage';
import JourneyListPage from './components/transactions/JourneyListPage';
import FormDemo from './components/demo/FormDemo';
import DashboardDemo from './components/demo/DashboardDemo';

export default function App() {
  return (
    <ConfigProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/settings/attributes" element={<AttributeListPage />} />
              <Route path="/settings/users" element={<UserListPage />} />
              <Route path="/transactions/journeys" element={<JourneyListPage />} />
              <Route path="/demo/create-indent" element={<FormDemo />} />
              <Route path="/demo/dashboard" element={<DashboardDemo />} />
              <Route path="*" element={<Navigate to="/settings/attributes" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ConfigProvider>
  );
}
