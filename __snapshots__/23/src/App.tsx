import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GastroServe from './pages/GastroServe'
import GastroMenu from './pages/GastroMenu'
import GastroStock from './pages/GastroStock'
import GastroFinance from './pages/GastroFinance'
import GastroTalent from './pages/GastroTalent'
import GastroInsight from './pages/GastroInsight'
import GastroLoyalty from './pages/GastroLoyalty'
import GastroLayout from './pages/GastroLayout'
import GastroWeb from './pages/GastroWeb'
import GastroNetwork from './pages/GastroNetwork'
import GastroOrder from './pages/GastroOrder'

function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/"
        element={user ? <Layout /> : <Navigate to="/login" replace />}
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="menu" element={<GastroMenu />} />
        <Route path="serve" element={<GastroServe />} />
        <Route path="stock" element={<GastroStock />} />
        <Route path="finance" element={<GastroFinance />} />
        <Route path="talent" element={<GastroTalent />} />
        <Route path="insight" element={<GastroInsight />} />
        <Route path="loyalty" element={<GastroLoyalty />} />
        <Route path="layout" element={<GastroLayout />} />
        <Route path="web" element={<GastroWeb />} />
        <Route path="network" element={<GastroNetwork />} />
        <Route path="order" element={<GastroOrder />} />
        <Route path="network" element={<GastroNetwork />} />
        <Route path="ops" element={<Dashboard />} />
        <Route path="predict" element={<GastroInsight />} />
        <Route path="go" element={<GastroWeb />} />
        <Route path="events" element={<GastroLoyalty />} />
        <Route path="supply" element={<GastroStock />} />
        <Route path="connect" element={<Dashboard />} />
        <Route path="academy" element={<GastroNetwork />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}

export default App
