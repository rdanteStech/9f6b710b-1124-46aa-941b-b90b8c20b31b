import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { StockProvider } from './context/StockContext';
import { ServeProvider } from './context/ServeContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StockProvider>
          <ServeProvider>
            <App />
          </ServeProvider>
        </StockProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
