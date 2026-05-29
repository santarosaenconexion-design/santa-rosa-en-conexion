import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type Reporte = {
  id: string
  calle: string
  entre_calles: string
  descripcion: string
  lat: number
  lng: number
}

type Props = {
  reportes: Reporte[]
}

function Mapa({ reportes }: Props) {
  return (
    <MapContainer
      center={[-36.6167, -64.2833]}
      zoom={13}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {reportes.map(r => (
        <CircleMarker
          key={r.id}
          center={[r.lat, r.lng]}
          radius={10}
          color="#2A9DC8"
        >
          <Popup>
            <strong>{r.calle}</strong> entre {r.entre_calles}<br />
            {r.descripcion}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

export default Mapa