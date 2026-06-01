import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Reportar from './pages/Reportar'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import MisReportes from './pages/MisReportes'
import Acerca from './pages/Acerca'          // ← AGREGAR

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/reportar" element={<Reportar />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mis-reportes" element={<MisReportes />} />
        <Route path="/acerca" element={<Acerca />} />   {/* ← AGREGAR */}
      </Routes>
    </>
  )
}

export default App