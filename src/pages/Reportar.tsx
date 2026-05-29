import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'

type FormData = {
  calle: string
  entre_calles: string
  descripcion: string
  categoria_id: string
}

function Reportar() {
  const { register, handleSubmit, reset } = useForm<FormData>()
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [foto, setFoto] = useState<File | null>(null)

  async function onSubmit(data: FormData) {
    setCargando(true)
    setMensaje('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMensaje('Tenés que iniciar sesión para reportar.')
        setCargando(false)
        return
      }

      let foto_url = ''
      if (foto) {
        const { data: upload, error: uploadError } = await supabase.storage
          .from('fotos')
          .upload(`reportes/${Date.now()}-${foto.name}`, foto)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(upload.path)
        foto_url = urlData.publicUrl
      }

      const { error } = await supabase.from('reportes').insert({
        ...data,
        foto_url,
        usuario_id: user.id,
        barrio_id: '00000000-0000-0000-0000-000000000000',
        ubicacion: null,
      })

      if (error) throw error
      setMensaje('¡Reporte enviado! Será revisado por el equipo.')
      reset()
      setFoto(null)
    } catch (err: any) {
      setMensaje('Error al enviar el reporte. Intentá de nuevo.')
    }

    setCargando(false)
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <h1>Reportar un problema</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: 16 }}>
          <label>Calle</label>
          <input {...register('calle', { required: true })}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Entre calles</label>
          <input {...register('entre_calles', { required: true })}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Descripción</label>
          <textarea {...register('descripcion')}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, height: 100 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Foto</label>
          <input type="file" accept="image/*"
            onChange={e => setFoto(e.target.files?.[0] || null)}
            style={{ display: 'block', marginTop: 4 }} />
        </div>
        {mensaje && <p style={{ color: mensaje.includes('Error') ? 'red' : 'green' }}>{mensaje}</p>}
        <button type="submit" disabled={cargando} style={{ padding: '8px 24px' }}>
          {cargando ? 'Enviando...' : 'Enviar reporte'}
        </button>
      </form>
    </div>
  )
}

export default Reportar