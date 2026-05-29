import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Reporte = {
  id: string
  calle: string
  entre_calles: string
  descripcion: string
  foto_url: string
  created_at: string
  estado: string
}

function Admin() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarReportes()
  }, [])

  async function cargarReportes() {
    const { data } = await supabase
      .from('reportes')
      .select('*')
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: false })
    if (data) setReportes(data)
    setCargando(false)
  }

  async function aprobar(id: string) {
    await supabase.from('reportes').update({
      estado: 'aprobado',
      aprobado_at: new Date().toISOString()
    }).eq('id', id)
    cargarReportes()
  }

  async function rechazar(id: string) {
    const motivo = prompt('Motivo del rechazo:')
    if (!motivo) return
    await supabase.from('reportes').update({
      estado: 'rechazado',
      motivo_rechazo: motivo
    }).eq('id', id)
    cargarReportes()
  }

  if (cargando) return <p>Cargando...</p>

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <h1>Panel de moderación</h1>
      <p>{reportes.length} reportes pendientes</p>
      {reportes.length === 0 && <p>No hay reportes pendientes. ✅</p>}
      {reportes.map(r => (
        <div key={r.id} style={{ border: '1px solid #ccc', padding: 20, marginBottom: 16, borderRadius: 8 }}>
          <strong>{r.calle}</strong> entre {r.entre_calles}
          <p>{r.descripcion}</p>
          {r.foto_url && <img src={r.foto_url} alt="foto" style={{ maxWidth: 300, display: 'block', marginBottom: 12 }} />}
          <small>{new Date(r.created_at).toLocaleDateString('es-AR')}</small>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={() => aprobar(r.id)} style={{ padding: '8px 16px', background: 'green', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              ✓ Aprobar
            </button>
            <button onClick={() => rechazar(r.id)} style={{ padding: '8px 16px', background: 'red', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              ✗ Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Admin