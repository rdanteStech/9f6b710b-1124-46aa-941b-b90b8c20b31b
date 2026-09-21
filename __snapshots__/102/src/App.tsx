import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ServeProvider } from './context/ServeContext';
import { StockProvider } from './context/StockContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import { modules } from './data/modules';

function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <ServeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<Layout />}>
                {modules.map(m => {
                  const Component = m.component;
                  return <Route key={m.id} path={m.path} element={<Component />} />;
                })}
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ServeProvider>
      </StockProvider>
    </AuthProvider>
  );
}

export default App;
