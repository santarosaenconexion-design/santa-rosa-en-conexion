import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Mapa from '../components/Mapa'

type Reporte = {
  id: string
  calle: string
  entre_calles: string
  descripcion: string
  lat: number
  lng: number
}

function Inicio() {
  const [reportes, setReportes] = useState<Reporte[]>([])

  useEffect(() => {
    async function cargarReportes() {
      const { data } = await supabase
        .from('reportes')
        .select('id, calle, entre_calles, descripcion, ubicacion')
        .eq('estado', 'aprobado')
      
      if (data) {
        const reportesConCoordenadas = data
          .filter(r => r.ubicacion)
          .map(r => ({
            ...r,
            lat: r.ubicacion.coordinates[1],
            lng: r.ubicacion.coordinates[0],
          }))
        setReportes(reportesConCoordenadas)
      }
    }
    cargarReportes()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Santa Rosa en Conexión</h1>
      <p>Reportes de problemas urbanos en nuestra ciudad.</p>
      <Mapa reportes={reportes} />
    </div>
  )
}

export default Inicio