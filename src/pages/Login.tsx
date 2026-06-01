import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [telefono, setTelefono] = useState('')
  const [esRegistro, setEsRegistro] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [verPassword, setVerPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setMensaje('')

    if (esRegistro) {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { nombre, apellido, telefono } }
      })
      if (error) {
        setMensaje(error.message)
      } else if (data.user) {
        await supabase.from('usuarios').upsert({
          id: data.user.id, nombre, apellido, email, telefono,
        })
        await supabase.functions.invoke('enviar-email', {
          body: { tipo: 'bienvenida', email, nombre }
        })
        setMensaje('¡Revisá tu email para confirmar tu cuenta!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMensaje(error.message)
      else window.location.href = '/'
    }
    setCargando(false)
  }

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%',
    padding: '9px 12px', marginTop: 6,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--gris-borde)',
    fontSize: 13, color: 'var(--azul)',
    background: '#fff', outline: 'none',
    fontFamily: 'var(--sans)',
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 500, color: 'var(--azul)', display: 'block',
  }

  const esError = mensaje.toLowerCase().includes('error') || mensaje.toLowerCase().includes('invalid')

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--gris-suave)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420, background: '#fff',
        borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-elevated)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ background: 'var(--azul)', padding: '22px 28px', borderBottom: '2px solid var(--celeste)' }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#7DD4E8' }}>
            Santa Rosa <span style={{ color: '#fff' }}>en Conexión</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            {esRegistro ? 'Creá tu cuenta para reportar problemas' : 'Accedé a tu cuenta'}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '26px 28px' }}>
          <form onSubmit={handleSubmit}>
            {esRegistro && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>Nombre</label>
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Apellido</label>
                    <input type="text" value={apellido} onChange={e => setApellido(e.target.value)} style={inputStyle} required />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Teléfono</label>
                  <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                    placeholder="Ej: 2954 123456" style={inputStyle} />
                </div>
              </>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <input
                  type={verPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, marginTop: 0, paddingRight: 40 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--gris-texto)', fontSize: 16, padding: 2,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {verPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {esRegistro && (
              <div style={{
                fontSize: 11, color: 'var(--gris-texto)', marginBottom: 16,
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--gris-suave)', borderLeft: '3px solid var(--celeste)',
                lineHeight: 1.5,
              }}>
                🔒 Tus datos son confidenciales y solo se usan para validar reportes. No se muestran públicamente.
              </div>
            )}

            {mensaje && (
              <div style={{
                fontSize: 12, marginBottom: 16, padding: '9px 12px', borderRadius: 8,
                background: esError ? '#FCEBEB' : '#EAF3DE',
                color: esError ? 'var(--rojo)' : 'var(--verde)',
                borderLeft: `3px solid ${esError ? 'var(--rojo)' : 'var(--verde)'}`,
              }}>
                {mensaje}
              </div>
            )}

            <button type="submit" disabled={cargando} style={{
              width: '100%', padding: '10px 0',
              borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--celeste)', color: '#fff',
              fontWeight: 500, fontSize: 13,
              cursor: cargando ? 'default' : 'pointer',
              opacity: cargando ? 0.7 : 1,
              fontFamily: 'var(--sans)',
              transition: 'background 0.15s',
            }}>
              {cargando ? 'Cargando...' : esRegistro ? 'Crear cuenta' : 'Ingresar'}
            </button>
          </form>

          <p style={{ marginTop: 18, fontSize: 12, color: 'var(--gris-texto)', textAlign: 'center' }}>
            {esRegistro ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
            <button onClick={() => { setEsRegistro(!esRegistro); setMensaje('') }}
              style={{ background: 'none', border: 'none', color: 'var(--celeste)', cursor: 'pointer', fontWeight: 500, fontSize: 12 }}>
              {esRegistro ? 'Iniciá sesión' : 'Registrate'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login