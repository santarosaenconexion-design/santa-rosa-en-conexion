import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Stats = {
  total: number
  aprobados: number
  pendientes: number
  totalApoyos: number
}

type CategoriaStat = { nombre: string; icono: string; count: number; color: string }
type BarrioStat = { nombre: string; count: number }
type ReporteReciente = {
  id: string
  calle: string
  entre_calles: string
  estado: string
  created_at: string
  apoyos_count: number
  categorias?: { nombre: string; icono: string }
  barrios?: { nombre: string }
}

const colorCat: Record<string, string> = {
  'Bacheo':          '#1A7A9A',
  'Luminarias':      '#d97706',
  'Pérdida de Agua': '#2A9DC8',
  'Cloacas':         '#8B5E3C',
  'Arbolado Urbano': '#27ae60',
  'Residuos':        '#7F8C8D',
}

const estadoConfig: Record<string, { label: string; color: string; icon: string }> = {
  aprobado:  { label: 'Publicado',  color: '#2A9DC8', icon: '📍' },
  pendiente: { label: 'Pendiente',  color: '#d97706', icon: '⏳' },
  rechazado: { label: 'Rechazado',  color: '#C0392B', icon: '✕'  },
}

function BarraHorizontal({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 90, fontSize: 11, color: '#6B7280', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: '#F0F4F6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.4s' }} />
      </div>
      <div style={{ width: 28, fontSize: 11, fontWeight: 700, color: '#1C3A4A', textAlign: 'right', flexShrink: 0 }}>{count}</div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, aprobados: 0, pendientes: 0, totalApoyos: 0 })
  const [categorias, setCategorias] = useState<CategoriaStat[]>([])
  const [barrios, setBarrios] = useState<BarrioStat[]>([])
  const [reportes, setReportes] = useState<ReporteReciente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarTodo() {
      const { data } = await supabase
        .from('reportes')
        .select('id, calle, entre_calles, estado, created_at, apoyos_count, categorias(nombre, icono), barrios(nombre)')
        .order('created_at', { ascending: false })

      if (data) {
        // Stats globales
        const totalApoyos = data.reduce((acc, r) => acc + (r.apoyos_count ?? 0), 0)
        setStats({
          total: data.length,
          aprobados: data.filter(r => r.estado === 'aprobado').length,
          pendientes: data.filter(r => r.estado === 'pendiente').length,
          totalApoyos,
        })

        // Por categoría
        const contCat: Record<string, CategoriaStat> = {}
        data.forEach((r: any) => {
          const nombre = r.categorias?.nombre ?? 'Sin categoría'
          const icono = r.categorias?.icono ?? '📋'
          if (!contCat[nombre]) contCat[nombre] = { nombre, icono, count: 0, color: colorCat[nombre] ?? '#1C3A4A' }
          contCat[nombre].count++
        })
        setCategorias(Object.values(contCat).sort((a, b) => b.count - a.count))

        // Por barrio (top 5)
        const contBarrio: Record<string, number> = {}
        data.forEach((r: any) => {
          const nombre = r.barrios?.nombre ?? 'Sin barrio'
          contBarrio[nombre] = (contBarrio[nombre] ?? 0) + 1
        })
        const top5 = Object.entries(contBarrio)
          .map(([nombre, count]) => ({ nombre, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
        setBarrios(top5)

        setReportes(data as ReporteReciente[])
      }
      setCargando(false)
    }
    cargarTodo()
  }, [])

  const reportesFiltrados = reportes.filter(r => {
    const q = busqueda.toLowerCase()
    return (
      r.calle?.toLowerCase().includes(q) ||
      r.entre_calles?.toLowerCase().includes(q) ||
      (r.barrios as any)?.nombre?.toLowerCase().includes(q)
    )
  })

  const maxCat = categorias[0]?.count ?? 1
  const maxBarrio = barrios[0]?.count ?? 1

  const tarjetas = [
    { label: 'Reportes publicados', valor: stats.aprobados, delta: 'en el mapa', color: '#1C3A4A', bg: '#EBF5FB' },
    { label: 'Vecinos participantes', valor: stats.total, delta: 'reportes totales', color: '#2D7D46', bg: '#EAFAF1' },
    { label: 'Con apoyos', valor: stats.totalApoyos, delta: 'apoyos acumulados', color: '#d97706', bg: '#FFF8E1' },
    { label: 'En revisión', valor: stats.pendientes, delta: 'pendientes', color: '#C0392B', bg: '#FDEDEC' },
  ]

  if (cargando) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <p style={{ color: '#6B7280' }}>Cargando estadísticas...</p>
    </div>
  )

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1C3A4A', padding: '24px 40px 20px', borderBottom: '2px solid #2A9DC8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, margin: 0, fontWeight: 800 }}>Estado de la ciudad · Santa Rosa</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '4px 0 0', fontFamily: 'monospace' }}>
              Datos actualizados · Plataforma ciudadana abierta
            </p>
          </div>
          <span style={{
            background: 'rgba(42,157,200,0.15)', border: '1px solid rgba(42,157,200,0.3)',
            color: '#7DD4E8', fontSize: 10, padding: '4px 12px', borderRadius: 20, fontFamily: 'monospace', letterSpacing: 1,
          }}>
            ACCESO LIBRE
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 48px' }}>

        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {tarjetas.map(t => (
            <div key={t.label} style={{
              background: '#fff', borderRadius: 12, padding: '20px 18px',
              borderTop: `4px solid ${t.color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>{t.label}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: t.color, lineHeight: 1 }}>{t.valor}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{t.delta}</div>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>

          {/* Por categoría */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1C3A4A' }}>Reportes por categoría</span>
              <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', textTransform: 'uppercase' }}>Total</span>
            </div>
            {categorias.map(c => (
              <BarraHorizontal key={c.nombre} label={`${c.icono} ${c.nombre}`} count={c.count} max={maxCat} color={c.color} />
            ))}
          </div>

          {/* Por barrio */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1C3A4A' }}>Barrios con más reportes</span>
              <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', textTransform: 'uppercase' }}>Top 5</span>
            </div>
            {barrios.map((b, i) => (
              <BarraHorizontal key={b.nombre} label={b.nombre} count={b.count} max={maxBarrio}
                color={['#1C3A4A','#2E4F60','#607D8B','#7D99A8','#A8BDC8'][i]} />
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1C3A4A' }}>Reportes recientes</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 12px' }}>
              <span style={{ fontSize: 12 }}>🔍</span>
              <input
                type="text"
                placeholder="Buscar por calle o barrio..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 12, outline: 'none', width: 180, color: '#1C3A4A' }}
              />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #E5E7EB' }}>
                {['Reporte', 'Categoría', 'Barrio', 'Fecha', 'Apoyos', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'monospace' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportesFiltrados.slice(0, 10).map(r => {
                const cat = r.categorias as any
                const barrio = r.barrios as any
                const est = estadoConfig[r.estado] ?? estadoConfig.pendiente
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F3F4F6' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 14px', color: '#374151', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ background: '#F3F4F6', borderRadius: 4, padding: '2px 6px', marginRight: 6, fontSize: 13 }}>{cat?.icono ?? '📋'}</span>
                      {r.calle}{r.entre_calles ? ` e/ ${r.entre_calles}` : ''}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: '#E8F5FB', color: '#0D6E8C', fontSize: 10,
                        padding: '2px 8px', borderRadius: 20, fontFamily: 'monospace',
                      }}>
                        {cat?.nombre ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#6B7280' }}>{barrio?.nombre ?? '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#6B7280' }}>
                      {new Date(r.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: Math.min((r.apoyos_count ?? 0) * 4, 40), height: 4, background: '#2A9DC8', borderRadius: 2 }} />
                        <span style={{ color: '#1C3A4A', fontWeight: 600 }}>{r.apoyos_count ?? 0}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: est.color, fontWeight: 600 }}>{est.icon} {est.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {reportesFiltrados.length === 0 && (
            <p style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>No se encontraron reportes.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard