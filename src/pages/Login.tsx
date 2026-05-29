import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [esRegistro, setEsRegistro] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setMensaje('')

    if (esRegistro) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMensaje(error.message)
      else setMensaje('¡Revisá tu email para confirmar tu cuenta!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMensaje(error.message)
    }
    setCargando(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1>{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
            required
          />
        </div>
        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
        <button type="submit" disabled={cargando} style={{ padding: '8px 24px' }}>
          {cargando ? 'Cargando...' : esRegistro ? 'Registrarse' : 'Entrar'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        {esRegistro ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
        <button onClick={() => setEsRegistro(!esRegistro)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
          {esRegistro ? 'Iniciá sesión' : 'Registrate'}
        </button>
      </p>
    </div>
  )
}

export default Login