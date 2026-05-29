import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Stats = {
  total: number
  pendientes: number
  aprobados: number
  rechazados: number
}

function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, pendientes: 0, aprobados: 0, rechazados: 0 })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarStats() {
      const { data } = await supabase.from('reportes').select('estado')
      if (data) {
        setStats({
          total: data.length,
          pendientes: data.filter(r => r.estado === 'pendiente').length,
          aprobados: data.filter(r => r.estado === 'aprobado').length,
          rechazados: data.filter(r => r.estado === 'rechazado').length,
        })
      }
      setCargando(false)
    }
    cargarStats()
  }, [])

  if (cargando) return <p>Cargando...</p>

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24 }}>
        <div style={{ background: '#f0f0f0', padding: 24, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 'bold' }}>{stats.total}</div>
          <div>Total reportes</div>
        </div>
        <div style={{ background: '#fff3cd', padding: 24, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 'bold' }}>{stats.pendientes}</div>
          <div>Pendientes</div>
        </div>
        <div style={{ background: '#d4edda', padding: 24, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 'bold' }}>{stats.aprobados}</div>
          <div>Aprobados</div>
        </div>
        <div style={{ background: '#f8d7da', padding: 24, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 'bold' }}>{stats.rechazados}</div>
          <div>Rechazados</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard