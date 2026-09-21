import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GastroServe from './pages/GastroServe'
import GastroMenu from './pages/GastroMenu'
import GastroRecipe from './pages/GastroRecipe'
import GastroStock from './pages/GastroStock'
import GastroFinance from './pages/GastroFinance'
import GastroTalent from './pages/GastroTalent'
import GastroInsight from './pages/GastroInsight'
import GastroLoyalty from './pages/GastroLoyalty'
import GastroLayout from './pages/GastroLayout'
import GastroWeb from './pages/GastroWeb'
import GastroNetwork from './pages/GastroNetwork'
import GastroConnect from './pages/GastroConnect'
import GastroSupply from './pages/GastroSupply'
import GastroPredict from './pages/GastroPredict'
import GastroGo from './pages/GastroGo'
import GastroEvents from './pages/GastroEvents'
import GastroAcademy from './pages/GastroAcademy'
import GastroEye from './pages/GastroEye'
import GastroReserve from './pages/GastroReserve'
import SettingsPage from './pages/Settings'
import GastroOps from './pages/GastroOps'
import GastroClients from './pages/GastroClients'

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
        <Route path="recipe" element={<GastroRecipe />} />
        <Route path="serve" element={<GastroServe />} />
        <Route path="stock" element={<GastroStock />} />
        <Route path="finance" element={<GastroFinance />} />
        <Route path="talent" element={<GastroTalent />} />
        <Route path="insight" element={<GastroInsight />} />
        <Route path="loyalty" element={<GastroLoyalty />} />
        <Route path="layout" element={<GastroLayout />} />
        <Route path="web" element={<GastroWeb />} />
        <Route path="network" element={<GastroNetwork />} />
        <Route path="connect" element={<GastroConnect />} />
        <Route path="supply" element={<GastroSupply />} />
        <Route path="ops" element={<GastroOps />} />
        <Route path="predict" element={<GastroPredict />} />
        <Route path="go" element={<GastroGo />} />
        <Route path="events" element={<GastroEvents />} />
        <Route path="clients" element={<GastroClients />} />
        <Route path="academy" element={<GastroAcademy />} />
        <Route path="eye" element={<GastroEye />} />
        <Route path="reserve" element={<GastroReserve />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}

export default App
