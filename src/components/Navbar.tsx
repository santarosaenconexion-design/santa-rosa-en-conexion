import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Navbar() {
  const [usuario, setUsuario] = useState<any>(null)
  const [esAdmin, setEsAdmin] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [ancho, setAncho] = useState(window.innerWidth)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => setAncho(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setMenuAbierto(false)
  }, [location.pathname])

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
  const isMobile = ancho < 768

  const navLinkStyle = (path: string): React.CSSProperties => ({
    fontSize: 13,
    color: isActive(path) ? '#fff' : 'rgba(255,255,255,0.6)',
    padding: '6px 12px',
    borderRadius: 8,
    background: isActive(path) ? 'rgba(255,255,255,0.12)' : 'transparent',
    fontWeight: isActive(path) ? 500 : 400,
    display: 'block',
  })

  const inicial = usuario?.email?.[0]?.toUpperCase() ?? '?'

  const links = (
    <>
      <Link to="/" style={navLinkStyle('/')}>Mapa</Link>
      <Link to="/dashboard" style={navLinkStyle('/dashboard')}>Dashboard</Link>
      <Link to="/reportar" style={navLinkStyle('/reportar')}>Reportar</Link>
      <Link to="/acerca" style={navLinkStyle('/acerca')}>Acerca</Link>
      {usuario && <Link to="/mis-reportes" style={navLinkStyle('/mis-reportes')}>Mis reportes</Link>}
      {esAdmin && <Link to="/admin" style={navLinkStyle('/admin')}>Admin</Link>}
    </>
  )

  return (
    <>
      <nav style={{
        background: '#1C3A4A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 50,
        borderBottom: '2px solid var(--celeste)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        <Link to="/" style={{ fontSize: 13, fontWeight: 500, color: '#7DD4E8', letterSpacing: 0.5, fontFamily: 'var(--sans)', flexShrink: 0 }}>
          <span style={{ color: '#fff' }}>Santa Rosa</span> en Conexión
        </Link>

        {!isMobile && (
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {links}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isMobile && usuario && (
            <>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--celeste)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0,
              }}>{inicial}</div>
              <button onClick={cerrarSesion} style={{
                background: 'transparent',
                border: '0.5px solid rgba(255,255,255,0.25)',
                color: 'rgba(255,255,255,0.6)',
                padding: '5px 12px', borderRadius: 8,
                fontSize: 12, fontFamily: 'var(--sans)', cursor: 'pointer',
              }}>Salir</button>
            </>
          )}
          {!isMobile && !usuario && (
            <Link to="/login" style={{
              background: 'var(--celeste)', color: '#fff',
              fontSize: 12, fontWeight: 500,
              padding: '6px 14px', borderRadius: 8,
            }}>Registrarse</Link>
          )}

          {isMobile && (
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fff', fontSize: 22, padding: 4, lineHeight: 1,
              }}
            >
              {menuAbierto ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>

      {isMobile && menuAbierto && (
        <div style={{
          background: '#1C3A4A',
          borderBottom: '2px solid var(--celeste)',
          padding: '8px 16px 16px',
          display: 'flex', flexDirection: 'column', gap: 2,
          position: 'sticky', top: 50, zIndex: 99,
        }}>
          {links}
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', marginTop: 8, paddingTop: 8 }}>
            {usuario ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{usuario.email}</span>
                <button onClick={cerrarSesion} style={{
                  background: 'transparent',
                  border: '0.5px solid rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.6)',
                  padding: '5px 12px', borderRadius: 8,
                  fontSize: 12, fontFamily: 'var(--sans)', cursor: 'pointer',
                }}>Salir</button>
              </div>
            ) : (
              <Link to="/login" style={{
                background: 'var(--celeste)', color: '#fff',
                fontSize: 13, fontWeight: 500,
                padding: '8px 16px', borderRadius: 8,
                display: 'block', textAlign: 'center',
              }}>Registrarse para reportar</Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar