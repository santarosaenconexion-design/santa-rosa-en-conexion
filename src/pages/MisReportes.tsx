import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

type MiReporte = {
  id: string
  calle: string
  entre_calles: string
  descripcion: string
  foto_url: string
  estado: string
  created_at: string
  apoyos_count: number
  motivo_rechazo?: string
  categorias?: { nombre: string; icono: string }
  barrios?: { nombre: string }
}

type MiApoyo = {
  id: string
  created_at: string
  reportes: {
    id: string
    calle: string
    entre_calles: string
    estado: string
    apoyos_count: number
    categorias?: { nombre: string; icono: string }
  }
}

const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
  aprobado:  { label: 'Publicado', color: '#27500A', bg: '#EAF3DE' },
  pendiente: { label: 'Pendiente', color: '#633806', bg: '#FAEEDA' },
  rechazado: { label: 'Rechazado', color: '#791F1F', bg: '#FCEBEB' },
}

function MisReportes() {
  const [misReportes, setMisReportes] = useState<MiReporte[]>([])
  const [misApoyos, setMisApoyos] = useState<MiApoyo[]>([])
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState<'reportes' | 'apoyos'>('reportes')
  const [borrando, setBorrando] = useState<string | null>(null)
  const navigate = useNavigate()

  async function cargar() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }

    const [{ data: reportes }, { data: apoyos }] = await Promise.all([
      supabase
        .from('reportes')
        .select('id, calle, entre_calles, descripcion, foto_url, estado, created_at, apoyos_count, motivo_rechazo, categorias(nombre, icono), barrios(nombre)')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('apoyos')
        .select('id, created_at, reportes(id, calle, entre_calles, estado, apoyos_count, categorias(nombre, icono))')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    if (reportes) setMisReportes(reportes as unknown as MiReporte[])
    if (apoyos) setMisApoyos(apoyos as unknown as MiApoyo[])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  async function borrarReporte(id: string) {
    if (!confirm('¿Borrar este reporte? Esta acción no se puede deshacer.')) return
    setBorrando(id)
    await supabase.from('reportes').delete().eq('id', id)
    await cargar()
    setBorrando(null)
  }

  const tabStyle = (t: string): React.CSSProperties => ({
    fontSize: 13, padding: '11px 18px', cursor: 'pointer',
    color: tab === t ? 'var(--celeste)' : 'var(--gris-texto)',
    borderBottom: `2px solid ${tab === t ? 'var(--celeste)' : 'transparent'}`,
    fontWeight: tab === t ? 500 : 400,
    background: 'none', border: 'none', fontFamily: 'var(--sans)', transition: 'color 0.15s',
  })

  return (
    <div style={{ background: 'var(--gris-suave)', minHeight: '100vh' }}>

      <div style={{ background: 'var(--azul)', padding: '20px 28px', borderBottom: '2px solid var(--celeste)' }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>Mis reportes</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
          Tus reportes enviados y los reclamos que apoyaste
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid var(--gris-borde)', padding: '0 28px', display: 'flex' }}>
        <button style={tabStyle('reportes')} onClick={() => setTab('reportes')}>
          Mis reportes {!cargando && `(${misReportes.length})`}
        </button>
        <button style={tabStyle('apoyos')} onClick={() => setTab('apoyos')}>
          Reportes que apoyé {!cargando && `(${misApoyos.length})`}
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 24px 48px' }}>
        {cargando ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--gris-texto)' }}>Cargando...</div>
        ) : tab === 'reportes' ? (
          misReportes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
              <p style={{ color: 'var(--gris-texto)', fontSize: 13, marginBottom: 16 }}>Todavía no enviaste ningún reporte</p>
              <button onClick={() => navigate('/reportar')} style={{
                background: 'var(--celeste)', color: '#fff', border: 'none',
                padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--sans)',
              }}>Hacer un reporte</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {misReportes.map(r => {
                const est = estadoConfig[r.estado] ?? estadoConfig.pendiente
                const cat = r.categorias as any
                const barrio = r.barrios as any
                return (
                  <div key={r.id} style={{
                    background: '#fff', borderRadius: 'var(--radius)',
                    border: '0.5px solid var(--gris-borde)',
                    boxShadow: 'var(--shadow-card)', overflow: 'hidden',
                    display: 'grid', gridTemplateColumns: r.foto_url ? '100px 1fr' : '1fr',
                    opacity: borrando === r.id ? 0.5 : 1,
                  }}>
                    {r.foto_url && (
                      <img src={r.foto_url} alt="foto"
                        style={{ width: 100, height: '100%', minHeight: 80, objectFit: 'cover', display: 'block' }} />
                    )}
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        {cat && (
                          <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--celeste)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {cat.icono} {cat.nombre}
                          </span>
                        )}
                        <span style={{ background: est.bg, color: est.color, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, marginLeft: 'auto' }}>
                          {est.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--azul)', marginBottom: 4 }}>
                        {r.calle}{r.entre_calles ? ` e/ ${r.entre_calles}` : ''}
                      </div>
                      {barrio?.nombre && (
                        <div style={{ fontSize: 11, color: 'var(--gris-texto)', marginBottom: 4 }}>{barrio.nombre}</div>
                      )}
                      {r.descripcion && (
                        <div style={{ fontSize: 11, color: 'var(--gris-texto)', lineHeight: 1.5, marginBottom: 8 }}>{r.descripcion}</div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--gris-texto)' }}>
                        <span>📅 {new Date(r.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        <span>👥 <strong style={{ color: 'var(--azul)' }}>{r.apoyos_count ?? 0}</strong> apoyos</span>
                      </div>

                      {/* Motivo de rechazo */}
                      {r.estado === 'rechazado' && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#791F1F', background: '#FCEBEB', padding: '8px 10px', borderRadius: 6, borderLeft: '3px solid var(--rojo)' }}>
                          <strong>Motivo del rechazo:</strong> {r.motivo_rechazo ?? 'Revisá tu email para más información.'}
                        </div>
                      )}

                      {/* Borrar — solo pendientes y rechazados */}
                      {(r.estado === 'pendiente' || r.estado === 'rechazado') && (
                        <button
                          onClick={() => borrarReporte(r.id)}
                          disabled={borrando === r.id}
                          style={{
                            marginTop: 10, padding: '5px 12px', borderRadius: 6,
                            border: '1px solid #f1a0a0', background: 'transparent',
                            color: 'var(--rojo)', fontSize: 11, cursor: 'pointer',
                            fontFamily: 'var(--sans)',
                          }}
                        >
                          🗑 Borrar reporte
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          misApoyos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👍</div>
              <p style={{ color: 'var(--gris-texto)', fontSize: 13 }}>Todavía no apoyaste ningún reporte</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {misApoyos.map(a => {
                const r = a.reportes as any
                if (!r) return null
                const est = estadoConfig[r.estado] ?? estadoConfig.pendiente
                const cat = r.categorias as any
                return (
                  <div key={a.id} style={{
                    background: '#fff', borderRadius: 'var(--radius)',
                    border: '0.5px solid var(--gris-borde)',
                    boxShadow: 'var(--shadow-card)', padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      {cat && (
                        <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--celeste)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {cat.icono} {cat.nombre}
                        </span>
                      )}
                      <span style={{ background: est.bg, color: est.color, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, marginLeft: 'auto' }}>
                        {est.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--azul)', marginBottom: 6 }}>
                      {r.calle}{r.entre_calles ? ` e/ ${r.entre_calles}` : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--gris-texto)' }}>
                      <span>👍 Apoyaste el {new Date(a.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long' })}</span>
                      <span>👥 <strong style={{ color: 'var(--azul)' }}>{r.apoyos_count ?? 0}</strong> apoyos totales</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default MisReportes