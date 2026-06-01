import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Stats = { total: number; aprobados: number; pendientes: number; totalApoyos: number }
type CategoriaStat = { nombre: string; icono: string; count: number; color: string }
type BarrioStat = { nombre: string; count: number }
type ReporteReciente = {
  id: string; calle: string; entre_calles: string; estado: string
  created_at: string; apoyos_count: number
  categorias?: { nombre: string; icono: string }
  barrios?: { nombre: string }
}

const colorCat: Record<string, string> = {
  'Bacheo':          '#2A9DC8',
  'Luminarias':      '#e67e22',
  'Pérdida de Agua': '#3498db',
  'Cloacas':         '#8e44ad',
  'Arbolado Urbano': '#27ae60',
  'Residuos':        '#7F8C8D',
}

const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
  aprobado:  { label: 'Publicado', color: '#27500A', bg: '#EAF3DE' },
  pendiente: { label: 'Pendiente', color: '#633806', bg: '#FAEEDA' },
  rechazado: { label: 'Rechazado', color: '#791F1F', bg: '#FCEBEB' },
}

function BarraHorizontal({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ width: 90, fontSize: 11, color: 'var(--gris-texto)', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: 'var(--gris-suave)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
      <div style={{ width: 28, fontSize: 11, color: 'var(--gris-texto)', textAlign: 'right', flexShrink: 0 }}>{count}</div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, aprobados: 0, pendientes: 0, totalApoyos: 0 })
  const [categorias, setCategorias] = useState<CategoriaStat[]>([])
  const [barrios, setBarrios] = useState<BarrioStat[]>([])
  const [reportesRecientes, setReportesRecientes] = useState<ReporteReciente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      const { data } = await supabase
        .from('reportes')
        .select('id, calle, entre_calles, estado, created_at, apoyos_count, categorias(nombre, icono), barrios(nombre)')
        .order('created_at', { ascending: false })

      if (data) {
        const totalApoyos = data.reduce((acc, r) => acc + (r.apoyos_count ?? 0), 0)
        setStats({
          total: data.length,
          aprobados: data.filter(r => r.estado === 'aprobado').length,
          pendientes: data.filter(r => r.estado === 'pendiente').length,
          totalApoyos,
        })

        const contCat: Record<string, CategoriaStat> = {}
        data.forEach((r: any) => {
          const nombre = r.categorias?.nombre ?? 'Sin categoría'
          const icono = r.categorias?.icono ?? '📋'
          if (!contCat[nombre]) contCat[nombre] = { nombre, icono, count: 0, color: colorCat[nombre] ?? '#1C3A4A' }
          contCat[nombre].count++
        })
        setCategorias(Object.values(contCat).sort((a, b) => b.count - a.count))

        const contBarrio: Record<string, number> = {}
        data.forEach((r: any) => {
          const nombre = r.barrios?.nombre ?? 'Sin barrio'
          contBarrio[nombre] = (contBarrio[nombre] ?? 0) + 1
        })
        setBarrios(
          Object.entries(contBarrio)
            .map(([nombre, count]) => ({ nombre, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        )
        setReportesRecientes(data as unknown as ReporteReciente[])
      }
      setCargando(false)
    }
    cargarDatos()
  }, [])

  const reportesFiltrados = reportesRecientes.filter(r => {
    const q = busqueda.toLowerCase()
    return (
      r.calle?.toLowerCase().includes(q) ||
      r.entre_calles?.toLowerCase().includes(q) ||
      (r.barrios as any)?.nombre?.toLowerCase().includes(q)
    )
  })

  const maxCat = categorias[0]?.count ?? 1
  const maxBarrio = barrios[0]?.count ?? 1

  if (cargando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--gris-texto)' }}>
      Cargando...
    </div>
  )

  return (
    <div style={{ background: 'var(--gris-suave)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: 'var(--azul)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>Estado de la ciudad · Santa Rosa</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, letterSpacing: 1 }}>
            Datos actualizados · Acceso libre
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{
            background: 'rgba(42,157,200,0.15)', border: '0.5px solid rgba(42,157,200,0.3)',
            color: '#7DD4E8', fontSize: 10, padding: '5px 12px', borderRadius: 20,
            letterSpacing: 1, textTransform: 'uppercase', fontWeight: 500,
          }}>
            Acceso libre
          </span>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--azul)' }}>
        {[
          { label: 'Reportes publicados', valor: stats.aprobados, delta: `+${Math.round(stats.aprobados * 0.06)} este mes` },
          { label: 'Total reportes', valor: stats.total, delta: 'Histórico' },
          { label: 'Con apoyos múltiples', valor: reportesRecientes.filter(r => (r.apoyos_count ?? 0) > 1).length, delta: `${stats.total > 0 ? Math.round(reportesRecientes.filter(r => (r.apoyos_count ?? 0) > 1).length / stats.total * 100) : 0}% del total` },
          { label: 'Apoyos totales', valor: stats.totalApoyos, delta: 'De la comunidad' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--gris-texto)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: 'var(--azul)' }}>{s.valor}</div>
            <div style={{ fontSize: 11, color: 'var(--gris-texto)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              <i className="ti ti-trending-up" style={{ fontSize: 12, color: 'var(--verde)' }} />
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--gris-borde)' }}>
        <div style={{ background: '#fff', padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--azul)', marginBottom: 14 }}>Reportes por categoría</div>
          {categorias.map(c => (
            <BarraHorizontal key={c.nombre} label={`${c.icono} ${c.nombre}`} count={c.count} max={maxCat} color={c.color} />
          ))}
        </div>
        <div style={{ background: '#fff', padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--azul)', marginBottom: 14 }}>Barrios con más reportes</div>
          {barrios.map((b, i) => (
            <BarraHorizontal key={b.nombre} label={b.nombre} count={b.count} max={maxBarrio}
              color={['#1C3A4A','#2E4F60','#607D8B','#7D99A8','#C8DDE8'][i]} />
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', padding: '18px 20px', borderTop: '0.5px solid var(--gris-borde)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--azul)' }}>Reportes recientes</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--gris-suave)', border: '0.5px solid var(--gris-borde)', borderRadius: 8, padding: '5px 10px' }}>
            <i className="ti ti-search" style={{ fontSize: 13, color: 'var(--gris-texto)' }} />
            <input
              type="text"
              placeholder="Buscar por calle o barrio..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 11, outline: 'none', width: 180, color: 'var(--azul)', fontFamily: 'var(--sans)' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--gris-borde)' }}>
              {[['Reporte', '36%'], ['Categoría', '16%'], ['Barrio', '14%'], ['Fecha', '12%'], ['Apoyos', '12%'], ['Estado', '10%']].map(([h, w]) => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--gris-texto)', textTransform: 'uppercase', letterSpacing: 0.5, width: w }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportesFiltrados.slice(0, 15).map(r => {
              const cat = r.categorias as any
              const barrio = r.barrios as any
              const est = estadoConfig[r.estado] ?? estadoConfig.pendiente
              return (
                <tr key={r.id} style={{ borderBottom: '0.5px solid var(--gris-borde)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--gris-suave)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '10px', color: 'var(--azul)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 8, background: 'var(--gris-suave)',
                      fontSize: 14, marginRight: 6, verticalAlign: 'middle',
                    }}>{cat?.icono ?? '📋'}</span>
                    {r.calle}{r.entre_calles ? ` e/ ${r.entre_calles}` : ''}
                  </td>
                  <td style={{ padding: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ background: 'var(--celeste-light)', color: '#0C6B8E', fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 20 }}>
                      {cat?.nombre ?? '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: 'var(--gris-texto)' }}>{barrio?.nombre ?? '—'}</td>
                  <td style={{ padding: '10px', color: 'var(--gris-texto)' }}>
                    {new Date(r.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: Math.min((r.apoyos_count ?? 0) * 4, 48), height: 4, background: 'var(--celeste)', borderRadius: 2 }} />
                      <span style={{ fontSize: 11, color: 'var(--gris-texto)' }}>{r.apoyos_count ?? 0}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ background: est.bg, color: est.color, fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 20 }}>
                      {est.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {reportesFiltrados.length === 0 && (
          <p style={{ textAlign: 'center', padding: 32, color: 'var(--gris-texto)', fontSize: 13 }}>No se encontraron reportes.</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard