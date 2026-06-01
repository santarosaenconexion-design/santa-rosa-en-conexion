import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import 'leaflet/dist/leaflet.css'

type Reporte = {
  id: string; calle: string; entre_calles: string; descripcion: string
  lat: number; lng: number; categoria: string; foto_url?: string; apoyos_count: number
}
type Props = { reportes: Reporte[] }

const colorCat: Record<string, string> = {
  'Bacheo': '#2A9DC8', 'Luminarias': '#e67e22', 'Pérdida de Agua': '#3498db',
  'Cloacas': '#8e44ad', 'Arbolado Urbano': '#27ae60', 'Residuos': '#7F8C8D',
}
const iconoCat: Record<string, string> = {
  'Bacheo': '🚧', 'Luminarias': '💡', 'Pérdida de Agua': '💧',
  'Cloacas': '🪠', 'Arbolado Urbano': '🌳', 'Residuos': '🗑️',
}

function Mapa({ reportes }: Props) {
  const [apoyando, setApoyando] = useState<string | null>(null)
  const [apoyosLocal, setApoyosLocal] = useState<Record<string, number>>({})

  async function apoyar(reporte: Reporte) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    setApoyando(reporte.id)
    await supabase.from('apoyos').insert({ reporte_id: reporte.id, usuario_id: user.id })
    await supabase.from('reportes').update({ apoyos_count: (reporte.apoyos_count ?? 0) + 1 }).eq('id', reporte.id)
    setApoyosLocal(prev => ({ ...prev, [reporte.id]: (prev[reporte.id] ?? reporte.apoyos_count) + 1 }))
    setApoyando(null)
  }

  return (
    <MapContainer
      center={[-36.6167, -64.2833]}
      zoom={13}
      minZoom={12}
      maxZoom={18}
      maxBounds={[[-36.75, -64.40], [-36.50, -64.15]]}
      maxBoundsViscosity={1.0}
      style={{ height: 480, width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {reportes.map(r => {
        const color = colorCat[r.categoria] ?? '#1C3A4A'
        const icono = iconoCat[r.categoria] ?? '📋'
        const apoyos = apoyosLocal[r.id] ?? r.apoyos_count ?? 0
        return (
          <CircleMarker
            key={r.id}
            center={[r.lat, r.lng]}
            radius={apoyos > 5 ? 14 : apoyos > 1 ? 11 : 8}
            pathOptions={{ color: '#fff', fillColor: color, fillOpacity: 0.9, weight: 2 }}
          >
            <Popup minWidth={200} maxWidth={240}>
              <div style={{ fontFamily: 'system-ui, sans-serif' }}>
                {r.foto_url && (
                  <img src={r.foto_url} alt="foto"
                    style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 6, marginBottom: 8, display: 'block' }} />
                )}
                {!r.foto_url && (
                  <div style={{ width: '100%', height: 60, background: '#E8F5FB', borderRadius: 6, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                    {icono}
                  </div>
                )}
                <div style={{ fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
                  {icono} {r.categoria}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1C3A4A', marginBottom: 4 }}>
                  {r.calle}{r.entre_calles ? ` e/ ${r.entre_calles}` : ''}
                </div>
                {r.descripcion && (
                  <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8, lineHeight: 1.4 }}>
                    {r.descripcion}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => apoyar(r)} disabled={apoyando === r.id} style={{
                    flex: 1, padding: '7px 0', background: '#2A9DC8', color: '#fff',
                    border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', opacity: apoyando === r.id ? 0.7 : 1,
                  }}>
                    👍 Sumarme
                  </button>
                  <div style={{ padding: '7px 10px', background: '#F3F4F2', borderRadius: 6, fontSize: 11, color: '#1C3A4A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    👥 {apoyos}
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}

export default Mapa