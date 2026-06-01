import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Navbar() {
  const [usuario, setUsuario] = useState<any>(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUsuario(data.user ?? null)
      if (data.user) {
        supabase.from('usuarios').select('es_admin').eq('id', data.user.id).single()
          .then(({ data: perfil }) => setEsAdmin(perfil?.es_admin === true))
      }
    })
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

  const isActive = (path: string) => location.pathname === path

  const navLinkStyle = (path: string): React.CSSProperties => ({
    fontSize: 13,
    color: isActive(path) ? '#fff' : 'rgba(255,255,255,0.5)',
    padding: '6px 12px',
    borderRadius: 8,
    background: isActive(path) ? 'rgba(255,255,255,0.12)' : 'transparent',
    transition: 'all 0.15s',
    fontWeight: isActive(path) ? 500 : 400,
  })

  const inicial = usuario?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <nav style={{
      background: '#1C3A4A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: 50,
      borderBottom: '2px solid var(--celeste)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <Link to="/" style={{ fontSize: 14, fontWeight: 500, color: '#7DD4E8', letterSpacing: 0.5, fontFamily: 'var(--sans)' }}>
        <span style={{ color: '#fff' }}>Santa Rosa</span> en Conexión
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <Link to="/" style={navLinkStyle('/')}>Mapa</Link>
        <Link to="/dashboard" style={navLinkStyle('/dashboard')}>Dashboard</Link>
        <Link to="/reportar" style={navLinkStyle('/reportar')}>Reportar</Link>
        {esAdmin && <Link to="/admin" style={navLinkStyle('/admin')}>Admin</Link>}
      </div>

      {/* Derecha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {usuario ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontSize: 12, color: 'rgba(255,255,255,0.5)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--celeste)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color: '#fff',
              }}>{inicial}</div>
            </div>
            <button onClick={cerrarSesion} style={{
              background: 'transparent',
              border: '0.5px solid rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.6)',
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'var(--sans)',
            }}>
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" style={{
            background: 'var(--celeste)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 500,
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
          }}>
            Registrarse para reportar
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar