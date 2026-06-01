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
  apoyos_count: number
  categorias?: { nombre: string; icono: string }
  usuarios?: { nombre: string; email: string }
}

function tiempoRelativo(fecha: string) {
  const diff = Date.now() - new Date(fecha).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

function Admin() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)
  const [tab, setTab] = useState<'pendiente' | 'aprobado' | 'rechazado'>('pendiente')

  useEffect(() => { cargarReportes() }, [tab])

  async function cargarReportes() {
    setCargando(true)
    const { data } = await supabase
      .from('reportes')
      .select('*, categorias(nombre, icono), usuarios(nombre, email)')
      .eq('estado', tab)
      .order('created_at', { ascending: false })
    if (data) setReportes(data)
    setCargando(false)
  }

  async function aprobar(r: Reporte) {
    setProcesando(r.id)
    await supabase.from('reportes').update({
      estado: 'aprobado',
      aprobado_at: new Date().toISOString()
    }).eq('id', r.id)
    await supabase.functions.invoke('enviar-email', {
      body: { tipo: 'aprobado', email: r.usuarios?.email, nombre: r.usuarios?.nombre, calle: r.calle, categoria: r.categorias?.nombre }
    })
    await cargarReportes()
    setProcesando(null)
  }

  async function rechazar(r: Reporte) {
    const motivo = prompt('Motivo del rechazo:')
    if (!motivo) return
    setProcesando(r.id)
    await supabase.from('reportes').update({
      estado: 'rechazado',
      motivo_rechazo: motivo
    }).eq('id', r.id)
    await supabase.functions.invoke('enviar-email', {
      body: { tipo: 'rechazado', email: r.usuarios?.email, nombre: r.usuarios?.nombre, calle: r.calle, categoria: r.categorias?.nombre, motivo }
    })
    await cargarReportes()
    setProcesando(null)
  }

  const tabStyle = (t: string): React.CSSProperties => ({
    fontSize: 13,
    padding: '11px 18px',
    cursor: 'pointer',
    color: tab === t ? 'var(--celeste)' : 'var(--gris-texto)',
    borderBottom: `2px solid ${tab === t ? 'var(--celeste)' : 'transparent'}`,
    marginBottom: -1,
    fontWeight: tab === t ? 500 : 400,
    background: 'none',
    border: 'none',
    borderBottom: `2px solid ${tab === t ? 'var(--celeste)' : 'transparent'}`,
    fontFamily: 'var(--sans)',
    transition: 'color 0.15s',
  })

  return (
    <div style={{ background: 'var(--gris-suave)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 28px',
        borderBottom: '0.5px solid var(--gris-borde)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 50, zIndex: 50,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--azul)' }}>Cola de moderación</div>
          <div style={{ fontSize: 11, color: 'var(--gris-texto)', marginTop: 2 }}>
            {reportes.length} reporte{reportes.length !== 1 ? 's' : ''} · {tab === 'pendiente' ? 'Esperando revisión' : tab === 'aprobado' ? 'Publicados en el mapa' : 'Rechazados'}
          </div>
        </div>
        <button onClick={cargarReportes} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 14px', borderRadius: 8,
          border: '1px solid var(--gris-borde)', background: '#fff',
          color: 'var(--azul)', fontSize: 12, fontWeight: 500, fontFamily: 'var(--sans)',
        }}>
          <i className="ti ti-refresh" style={{ fontSize: 13 }} />
          Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gris-borde)', padding: '0 28px', display: 'flex' }}>
        <button style={tabStyle('pendiente')} onClick={() => setTab('pendiente')}>Pendientes</button>
        <button style={tabStyle('aprobado')} onClick={() => setTab('aprobado')}>Aprobados</button>
        <button style={tabStyle('rechazado')} onClick={() => setTab('rechazado')}>Rechazados</button>
      </div>

      {/* Cola */}
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '20px 24px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cargando ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--gris-texto)', fontSize: 13 }}>Cargando...</div>
        ) : reportes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <p style={{ color: 'var(--gris-texto)', fontSize: 13 }}>No hay reportes en esta categoría</p>
          </div>
        ) : (
          reportes.map(r => (
            <div key={r.id} style={{
              background: '#fff', borderRadius: 'var(--radius)',
              border: '0.5px solid var(--gris-borde)',
              padding: 16,
              display: 'grid', gridTemplateColumns: '64px 1fr auto',
              gap: 14, alignItems: 'start',
              opacity: procesando === r.id ? 0.6 : 1,
              transition: 'opacity 0.2s',
              boxShadow: 'var(--shadow-card)',
            }}>
              {/* Thumb */}
              <div style={{
                width: 64, height: 64, borderRadius: 8,
                background: r.foto_url ? undefined : 'var(--celeste-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0, overflow: 'hidden',
              }}>
                {r.foto_url
                  ? <img src={r.foto_url} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : r.categorias?.icono ?? '📋'
                }
              </div>

              {/* Body */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {r.categorias && (
                    <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--celeste)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {r.categorias.icono} {r.categorias.nombre}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--gris-texto)', marginLeft: 'auto' }}>
                    {tiempoRelativo(r.created_at)}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--azul)', marginBottom: 3 }}>
                  {r.calle}{r.entre_calles ? ` e/ ${r.entre_calles}` : ''}
                </div>
                {r.usuarios && (
                  <div style={{ fontSize: 11, color: 'var(--gris-texto)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-user" style={{ fontSize: 12 }} />
                    {r.usuarios.nombre} · {r.usuarios.email}
                  </div>
                )}
                {r.descripcion && (
                  <div style={{ fontSize: 11, color: 'var(--gris-texto)', lineHeight: 1.5, marginTop: 4 }}>
                    {r.descripcion}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                {tab === 'pendiente' && (
                  <>
                    <button onClick={() => aprobar(r)} disabled={procesando === r.id} style={{
                      background: '#1A7A9A', color: '#fff', border: 'none',
                      padding: '8px 14px', borderRadius: 8,
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                      fontFamily: 'var(--sans)',
                    }}>
                      <i className="ti ti-check" style={{ fontSize: 13 }} /> Aprobar
                    </button>
                    <button onClick={() => rechazar(r)} disabled={procesando === r.id} style={{
                      background: 'transparent', color: 'var(--gris-texto)',
                      border: '0.5px solid var(--gris-borde)',
                      padding: '8px 14px', borderRadius: 8,
                      fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                      fontFamily: 'var(--sans)',
                    }}>
                      <i className="ti ti-x" style={{ fontSize: 13 }} /> Rechazar
                    </button>
                  </>
                )}
                {r.foto_url && (
                  <a href={r.foto_url} target="_blank" rel="noreferrer" style={{
                    background: 'transparent', color: 'var(--celeste)',
                    border: '0.5px solid rgba(42,157,200,0.3)',
                    padding: '6px 12px', borderRadius: 8,
                    fontSize: 11, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                    textDecoration: 'none',
                  }}>
                    <i className="ti ti-external-link" style={{ fontSize: 12 }} /> Ver foto
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Admin