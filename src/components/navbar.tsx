import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Navbar() {
  const [usuario, setUsuario] = useState<any>(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getUser().then(({ data }) => {
      setUsuario(data.user ?? null)
      if (data.user) {
        // Verificar si es admin en la tabla usuarios
        supabase
          .from('usuarios')
          .select('es_admin')
          .eq('id', data.user.id)
          .single()
          .then(({ data: perfil }) => {
            setEsAdmin(perfil?.es_admin === true)
          })
      }
    })

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null)
      if (!session?.user) setEsAdmin(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    setUsuario(null)
    setEsAdmin(false)
    navigate('/')
  }

  const linkStyle = { color: 'white', textDecoration: 'none', fontSize: 14 }

  return (
    <nav style={{
      background: '#1C3A4A',
      padding: '12px 48px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid #2A9DC8',
    }}>
      <Link to="/" style={{ color: '#7DD4E8', fontWeight: 'bold', fontSize: 20, textDecoration: 'none' }}>
        Santa Rosa en Conexión
      </Link>

      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <Link to="/" style={linkStyle}>Mapa</Link>
        <Link to="/reportar" style={linkStyle}>Reportar</Link>
        {esAdmin && (
          <Link to="/admin" style={linkStyle}>Admin</Link>
        )}
        {usuario ? (
          <button
            onClick={cerrarSesion}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#7DD4E8',
              padding: '4px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Cerrar sesión
          </button>
        ) : (
          <Link to="/login" style={{ color: '#7DD4E8', textDecoration: 'none', fontSize: 14 }}>
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar