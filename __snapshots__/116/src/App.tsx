import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AppShell from './pages/AppShell';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={<AppShell />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
