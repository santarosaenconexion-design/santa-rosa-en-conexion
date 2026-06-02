import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

type FormData = { calle: string; entre_calles: string; descripcion: string; categoria_id: string; barrio_id: string }
type Categoria = { id: string; nombre: string; icono: string }
type Barrio = { id: string; nombre: string }

const coloresCat: Record<string, string> = {
  'Bacheo': '#2A9DC8', 'Luminarias': '#e67e22', 'Pérdida de Agua': '#3498db',
  'Cloacas': '#8e44ad', 'Arbolado Urbano': '#27ae60', 'Residuos': '#7F8C8D',
}

const LIMITES = { latMin: -36.70, latMax: -36.55, lngMin: -64.35, lngMax: -64.20 }

function useAncho() {
  const [ancho, setAncho] = useState(window.innerWidth)
  useEffect(() => {
    const fn = () => setAncho(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return ancho
}

function Reportar() {
  const { register, handleSubmit, reset } = useForm<FormData>()
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [foto, setFoto] = useState<File | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [barrios, setBarrios] = useState<Barrio[]>([])
  const [catSeleccionada, setCatSeleccionada] = useState<string>('')
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsEstado, setGpsEstado] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [duplicado, setDuplicado] = useState<any>(null)
  const navigate = useNavigate()
  const ancho = useAncho()
  const isMobile = ancho < 768

  useEffect(() => {
    supabase.from('categorias').select('id, nombre, icono').then(({ data }) => { if (data) setCategorias(data) })
    supabase.from('barrios').select('id, nombre').order('nombre').then(({ data }) => { if (data) setBarrios(data) })
  }, [])

  function obtenerGPS() {
    setGpsEstado('loading')
    setMensaje('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        if (lat < LIMITES.latMin || lat > LIMITES.latMax || lng < LIMITES.lngMin || lng > LIMITES.lngMax) {
          setGpsEstado('error')
          setMensaje('Tu ubicación está fuera de Santa Rosa. Acercate al lugar del problema para reportarlo.')
          return
        }
        setUbicacion({ lat, lng })
        setGpsEstado('ok')
      },
      () => {
        setGpsEstado('error')
        setMensaje('No se pudo obtener tu ubicación. Verificá los permisos de GPS.')
      }
    )
  }

  async function onSubmit(data: FormData) {
    setCargando(true); setMensaje(''); setDuplicado(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      if (ubicacion) {
        const { data: cercanos } = await supabase.rpc('reportes_cercanos', { lat: ubicacion.lat, lng: ubicacion.lng, radio_metros: 100 })
        if (cercanos && cercanos.length > 0) { setDuplicado(cercanos[0]); setCargando(false); return }
      }
      let foto_url = ''
      if (foto) {
        const { data: upload, error: uploadError } = await supabase.storage.from('fotos').upload(`reportes/${Date.now()}-${foto.name}`, foto)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(upload.path)
        foto_url = urlData.publicUrl
      }
      const { error } = await supabase.from('reportes').insert({
        calle: data.calle, entre_calles: data.entre_calles, descripcion: data.descripcion,
        categoria_id: catSeleccionada || data.categoria_id, barrio_id: data.barrio_id === 'otro' ? null : data.barrio_id,
        foto_url, usuario_id: user.id,
        ubicacion: ubicacion ? `POINT(${ubicacion.lng} ${ubicacion.lat})` : null,
        estado: 'pendiente',
      })
      if (error) throw error
      setMensaje('¡Reporte enviado! Será revisado por el equipo.')
      reset(); setFoto(null); setCatSeleccionada(''); setUbicacion(null); setGpsEstado('idle')
    } catch { setMensaje('Error al enviar el reporte. Intentá de nuevo.') }
    setCargando(false)
  }

  async function apoyarDuplicado() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !duplicado) return
    await supabase.from('apoyos').insert({ reporte_id: duplicado.id, usuario_id: user.id })
    await supabase.from('reportes').update({ apoyos_count: (duplicado.apoyos_count ?? 0) + 1 }).eq('id', duplicado.id)
    setMensaje('¡Te sumaste al reporte existente!'); setDuplicado(null)
  }

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '9px 12px', marginTop: 6,
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--gris-borde)',
    fontSize: 13, color: 'var(--azul)', background: '#fff', outline: 'none', fontFamily: 'var(--sans)',
  }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--azul)', display: 'block' }
  const esError = mensaje.toLowerCase().includes('error') || mensaje.toLowerCase().includes('fuera')

  return (
    <div style={{ background: 'var(--gris-suave)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--azul)', padding: '16px 20px', borderBottom: '2px solid var(--celeste)' }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>Nuevo reporte</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Completá el formulario para reportar un problema urbano en Santa Rosa</div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: isMobile ? '16px 12px 40px' : '28px 24px 60px' }}>

        {duplicado && (
          <div style={{ background: '#FFF8E1', border: '1px solid #F59E0B', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, color: 'var(--amber)', marginBottom: 6, fontSize: 13 }}>⚠️ Ya existe un reporte similar a menos de 100 metros</div>
            <div style={{ fontSize: 12, color: 'var(--azul)', marginBottom: 12 }}>{duplicado.calle} — {duplicado.apoyos_count ?? 0} apoyos</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={apoyarDuplicado} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'var(--celeste)', color: '#fff', fontWeight: 500, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)' }}>👍 Apoyar ese reporte</button>
              <button onClick={() => setDuplicado(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--gris-borde)', background: '#fff', color: 'var(--gris-texto)', fontWeight: 500, fontSize: 12, cursor: 'pointer' }}>Reportar igual</button>
            </div>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>

          <div style={{ padding: '16px', borderBottom: '0.5px solid var(--gris-borde)' }}>
            <label style={{ ...labelStyle, marginBottom: 10 }}>Categoría</label>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 8 }}>
              {categorias.map(c => {
                const color = coloresCat[c.nombre] ?? '#1C3A4A'
                const sel = catSeleccionada === c.id
                return (
                  <div key={c.id} onClick={() => setCatSeleccionada(c.id)} style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    border: sel ? `1.5px solid ${color}` : '1px solid var(--gris-borde)',
                    background: sel ? `${color}14` : '#fff',
                    display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 18 }}>{c.icono}</span>
                    <span style={{ fontSize: 11, fontWeight: sel ? 600 : 400, color: sel ? color : 'var(--azul)' }}>{c.nombre}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ padding: '16px' }}>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Ubicación GPS</label>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" onClick={obtenerGPS} style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: `1px solid ${gpsEstado === 'ok' ? 'var(--celeste)' : gpsEstado === 'error' ? 'var(--rojo)' : 'var(--gris-borde)'}`,
                  background: gpsEstado === 'ok' ? 'var(--celeste)' : '#fff',
                  color: gpsEstado === 'ok' ? '#fff' : gpsEstado === 'error' ? 'var(--rojo)' : 'var(--azul)',
                  fontWeight: 500, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)',
                }}>
                  {gpsEstado === 'loading' ? '📡 Obteniendo...' : gpsEstado === 'ok' ? '✓ GPS obtenido' : gpsEstado === 'error' ? '⚠️ Reintentá' : '📍 Obtener ubicación'}
                </button>
                {ubicacion && <span style={{ fontSize: 11, color: 'var(--gris-texto)' }}>{ubicacion.lat.toFixed(4)}, {ubicacion.lng.toFixed(4)}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Calle</label>
                <input {...register('calle', { required: true })} style={inputStyle} placeholder="Ej: Av. Uruguay" />
              </div>
              <div>
                <label style={labelStyle}>Entre calles</label>
                <input {...register('entre_calles', { required: true })} style={inputStyle} placeholder="Ej: Mitre y Roca" />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Barrio</label>
              <select {...register('barrio_id', { required: true })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Seleccioná un barrio...</option>
                {barrios.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                <option value="otro">Otro / No sé</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Descripción</label>
              <textarea {...register('descripcion')} style={{ ...inputStyle, height: 88, resize: 'vertical' }} placeholder="Describí el problema con detalle..." />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Foto</label>
              <div style={{ marginTop: 8, border: '1px dashed var(--gris-borde)', borderRadius: 8, padding: '16px', textAlign: 'center', background: 'var(--gris-suave)' }}>
                <input type="file" accept="image/*" id="foto-input" onChange={e => setFoto(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                <label htmlFor="foto-input" style={{ cursor: 'pointer', fontSize: 12, color: 'var(--celeste)', fontWeight: 500 }}>
                  {foto ? `✓ ${foto.name}` : '📷 Seleccionar foto'}
                </label>
              </div>
            </div>

            {mensaje && (
              <div style={{ fontSize: 12, marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: esError ? '#FCEBEB' : '#EAF3DE', color: esError ? 'var(--rojo)' : 'var(--verde)', borderLeft: `3px solid ${esError ? 'var(--rojo)' : 'var(--verde)'}` }}>
                {mensaje}
              </div>
            )}

            <button type="button" onClick={handleSubmit(onSubmit)} disabled={cargando} style={{
              width: '100%', padding: '12px 0', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--celeste)', color: '#fff', fontWeight: 500, fontSize: 14,
              cursor: cargando ? 'default' : 'pointer', opacity: cargando ? 0.7 : 1, fontFamily: 'var(--sans)',
            }}>
              {cargando ? 'Enviando...' : '📨 Enviar reporte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reportar