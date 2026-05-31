import { Routes, Route } from 'react-router-dom'
import Inicio from './pages/Inicio'
import Login from './pages/Login'
import Reportar from './pages/Reportar'
import Admin from './pages/Admin'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/reportar" element={<Reportar />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App
