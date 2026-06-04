import { useState } from 'react'

function FormContacto() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    await fetch('https://formsubmit.co/ajax/santarosaenconexion@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ nombre, email, mensaje, _subject: 'Sugerencia desde Santa Rosa en Conexión' }),
    })
    setEnviado(true)
    setCargando(false)
  }

  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '9px 12px', marginTop: 6,
    borderRadius: 8, border: '1px solid var(--gris-borde)',
    fontSize: 13, color: 'var(--azul)', background: '#fff',
    outline: 'none', fontFamily: 'var(--sans)',
  }

  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--azul)', marginBottom: 16 }}>¿Tenés una sugerencia?</div>
      {enviado ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
          <div style={{ fontSize: 13, color: 'var(--verde)', fontWeight: 500 }}>¡Gracias por tu sugerencia!</div>
          <div style={{ fontSize: 12, color: 'var(--gris-texto)', marginTop: 4 }}>La vamos a revisar y responder por email.</div>
        </div>
      ) : (
        <form onSubmit={enviar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--azul)' }}>Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--azul)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--azul)' }}>Sugerencia o comentario</label>
            <textarea value={mensaje} onChange={e => setMensaje(e.target.value)}
              style={{ ...inputStyle, height: 90, resize: 'vertical' }}
              placeholder="Contanos qué mejorarías o cómo podemos ayudarte..." required />
          </div>
          <button type="submit" disabled={cargando} style={{
            width: '100%', padding: '10px', borderRadius: 8, border: 'none',
            background: 'var(--celeste)', color: '#fff', fontWeight: 500,
            fontSize: 13, cursor: cargando ? 'default' : 'pointer',
            opacity: cargando ? 0.7 : 1, fontFamily: 'var(--sans)',
          }}>
            {cargando ? 'Enviando...' : '📨 Enviar sugerencia'}
          </button>
        </form>
      )}
    </div>
  )
}

function Acerca() {
  return (
    <div style={{ background: 'var(--gris-suave)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'var(--azul)', padding: '28px 40px 32px', borderBottom: '2px solid var(--celeste)' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
          Proyecto de Responsabilidad Social Urbana
        </div>
        <h1 style={{ color: '#fff', fontSize: 28, margin: '0 0 8px', fontFamily: 'var(--serif)', fontWeight: 400, lineHeight: 1.2 }}>
          Santa Rosa <span style={{ color: '#7DD4E8', fontStyle: 'italic' }}>en Conexión</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: 0, maxWidth: 560, lineHeight: 1.7 }}>
          Una plataforma cívica que convierte lo que el vecino ve en su barrio en datos estructurados, georreferenciados y públicos. No pedimos que lo arreglen: documentamos que existe.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* ── 01 QUÉ ES ── */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid var(--azul)' }}>
            <span style={{ fontSize: 10, color: 'var(--celeste)', border: '1px solid var(--celeste)', padding: '3px 8px', letterSpacing: 2 }}>01</span>
            <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 20, color: 'var(--azul)', margin: 0, letterSpacing: -0.5 }}>¿Qué es Conexión?</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, background: 'var(--azul)', marginBottom: 24 }}>
            {[
              { label: 'Organización', valor: 'Conexión Exitosa', texto: 'Proyecto de Responsabilidad Social con foco en alfabetización digital y memoria colectiva urbana. Sin intención política ni institucional.' },
              { label: 'Objetivo', valor: 'Visibilizar · No exigir resolución', texto: 'Plataforma donde vecinos documentan y georreferencian problemas de infraestructura urbana.' },
              { label: 'Alcance', valor: 'Santa Rosa · La Pampa', texto: 'Ciudad de 115.000 habitantes sin ninguna plataforma pública de reclamo georreferenciado activa.' },
            ].map((c, i) => (
              <div key={i} style={{ background: i === 0 ? 'var(--azul)' : i === 2 ? 'var(--celeste)' : '#fff', padding: '28px 24px' }}>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' as const, opacity: 0.5, marginBottom: 8, color: i === 0 || i === 2 ? '#fff' : 'var(--azul)' }}>{c.label}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: i === 0 || i === 2 ? '#fff' : 'var(--azul)' }}>{c.valor}</div>
                <div style={{ fontSize: 12, lineHeight: 1.7, opacity: 0.7, color: i === 0 || i === 2 ? '#fff' : 'var(--gris-texto)' }}>{c.texto}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, background: 'var(--azul)' }}>
            <div style={{ background: '#EAF4F9', padding: '28px 24px' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'var(--gris-texto)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--gris-borde)' }}>Sin plataforma</div>
              {['El problema existe pero nadie lo sabe excepto quien lo ve', 'Sin registro público de qué ocurre ni desde cuándo', 'Cada vecino se siente solo con su problema', 'Sin datos para medios ni organizaciones'].map(t => (
                <div key={t} style={{ fontSize: 12, color: 'var(--gris-texto)', paddingLeft: 16, position: 'relative' as const, marginBottom: 8, lineHeight: 1.5 }}>
                  <span style={{ position: 'absolute' as const, left: 0, color: '#aaa' }}>✕</span>{t}
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', padding: '28px 24px' }}>
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'var(--verde)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--gris-borde)' }}>Con Conexión</div>
              {['Reporte georreferenciado con foto, calle y vecino visible', 'Dashboard público con historial desde el día del reporte', 'Apoyos de otros vecinos que dicen "yo también lo veo"', 'Datos exportables para medios y organizaciones'].map(t => (
                <div key={t} style={{ fontSize: 12, color: 'var(--azul)', paddingLeft: 16, position: 'relative' as const, marginBottom: 8, lineHeight: 1.5 }}>
                  <span style={{ position: 'absolute' as const, left: 0, color: 'var(--verde)' }}>✓</span>{t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 02 CÓMO REPORTAR ── */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid var(--azul)' }}>
            <span style={{ fontSize: 10, color: 'var(--celeste)', border: '1px solid var(--celeste)', padding: '3px 8px', letterSpacing: 2 }}>02</span>
            <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 20, color: 'var(--azul)', margin: 0 }}>¿Cómo hacer un reporte?</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { num: '1', icono: '👤', titulo: 'Registrate', desc: 'Creá tu cuenta con nombre, apellido y email. Solo se usa para validar reportes.' },
              { num: '2', icono: '📍', titulo: 'Ubicación GPS', desc: 'Al abrir el formulario, permitís el acceso a tu ubicación para georreferenciar el problema.' },
              { num: '3', icono: '📷', titulo: 'Foto + datos', desc: 'Elegí la categoría, escribí la calle, entre qué calles y sacá una foto del problema.' },
              { num: '4', icono: '✓', titulo: 'Enviá', desc: 'El equipo de Conexión revisa y aprueba. Te avisamos por email cuando esté publicado.' },
            ].map(p => (
              <div key={p.num} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '20px 16px', boxShadow: 'var(--shadow-card)', borderTop: '3px solid var(--celeste)' }}>
                <div style={{ fontSize: 10, color: 'var(--celeste)', marginBottom: 8, letterSpacing: 1 }}>PASO {p.num}</div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{p.icono}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--azul)', marginBottom: 6 }}>{p.titulo}</div>
                <div style={{ fontSize: 12, color: 'var(--gris-texto)', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '20px 24px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'var(--gris-texto)', marginBottom: 16 }}>Categorías disponibles</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { icono: '🚧', nombre: 'Bacheo y Pavimento', desc: 'Baches, grietas, hundimientos en calles o veredas.' },
                { icono: '💡', nombre: 'Luminarias', desc: 'Faroles fundidos, zonas sin iluminación nocturna.' },
                { icono: '💧', nombre: 'Pérdida de Agua', desc: 'Pérdidas en la vía pública, caños rotos, filtraciones.' },
                { icono: '🚿', nombre: 'Cloacas', desc: 'Desborde de cámaras, desagüe pluvial tapado.' },
                { icono: '🌳', nombre: 'Arbolado Urbano', desc: 'Árboles caídos, ramas peligrosas, raíces en veredas.' },
                { icono: '🗑️', nombre: 'Residuos y Limpieza', desc: 'Microbasurales, contenedores desbordados.' },
              ].map(c => (
                <div key={c.nombre} style={{ padding: '12px 14px', border: '1px solid var(--gris-borde)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icono}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--azul)', marginBottom: 2 }}>{c.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--gris-texto)', lineHeight: 1.5 }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 CASOS REALES ── */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid var(--azul)' }}>
            <span style={{ fontSize: 10, color: 'var(--celeste)', border: '1px solid var(--celeste)', padding: '3px 8px', letterSpacing: 2 }}>03</span>
            <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 20, color: 'var(--azul)', margin: 0 }}>Referentes y casos reales</h2>
          </div>

          <div style={{ background: 'var(--azul)', padding: '28px 32px', borderLeft: '4px solid var(--celeste)', marginBottom: 20, borderRadius: 'var(--radius)' }}>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, marginBottom: 12 }}>
              "No pedimos que lo arreglen. Documentamos que existe. Cada bache, cada luminaria apagada tiene ahora un pin en el mapa y un vecino que dice: yo lo vi."
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>— Principio fundador de Conexión</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { nombre: 'FixMyStreet · Reino Unido', dato: '2,8M reportes', desc: 'Desde 2007. Su valor principal: el archivo público más completo del estado urbano del Reino Unido. Fuente de datos para medios y organizaciones.', fuente: '2007 — presente' },
              { nombre: 'SeeClickFix · EEUU', dato: '4,7M problemas', desc: 'Documentados y georreferenciados. Fuente de datos para 400 municipios y decenas de medios locales. Sin presión institucional originaria.', fuente: '2008 — presente' },
              { nombre: 'Cuidemos la Ciudad · Córdoba', dato: '12.000 usuarios', desc: 'Primer modelo provincial argentino similar. Usado como fuente periodística por La Voz del Interior. Demuestra viabilidad en ciudades medianas del país.', fuente: 'Argentina · activo' },
              { nombre: 'Vecino Activo · Mendoza', dato: '8.000 reportes', desc: '3 municipios integrados. Ninguno con intención política originaria. El impacto vino del archivo público que construyeron, no de las resoluciones.', fuente: 'Argentina · activo' },
            ].map(c => (
              <div key={c.nombre} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'var(--celeste)', marginBottom: 6 }}>{c.fuente}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--azul)', marginBottom: 4 }}>{c.nombre}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--celeste)', marginBottom: 8 }}>{c.dato}</div>
                <div style={{ fontSize: 12, color: 'var(--gris-texto)', lineHeight: 1.7 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 04 NORMAS ── */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid var(--azul)' }}>
            <span style={{ fontSize: 10, color: 'var(--celeste)', border: '1px solid var(--celeste)', padding: '3px 8px', letterSpacing: 2 }}>04</span>
            <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 20, color: 'var(--azul)', margin: 0 }}>Normas de convivencia</h2>
          </div>

          <div style={{ background: 'var(--azul)', padding: '24px 32px', borderRadius: 'var(--radius)', marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'var(--celeste)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Pilares de responsabilidad social</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                { titulo: 'Sin intención política', desc: 'La plataforma no se presenta ante ninguna institución, no presiona por resoluciones ni toma partido. Solo documenta.' },
                { titulo: 'Alfabetización Digital', desc: 'Los vecinos aprenden a usar tecnología en el contexto de un problema cotidiano propio.' },
                { titulo: 'Transparencia total', desc: 'Todo reporte aprobado es público y descargable. No se oculta nada ni se editan resultados.' },
                { titulo: 'Autonomía ciudadana', desc: 'Solo quien creó el reporte puede registrar si el problema fue solucionado. Ninguna institución puede cerrarlo.' },
              ].map(p => (
                <div key={p.titulo} style={{ paddingLeft: 16, borderLeft: '2px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 4 }}>{p.titulo}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 10, color: 'var(--verde)', letterSpacing: 1, marginBottom: 12 }}>✓ SE PUEDE</div>
              {['Reportar problemas de infraestructura urbana reales', 'Apoyar reportes de otros vecinos', 'Subir fotos del estado actual del problema', 'Registrar cuando un problema fue resuelto', 'Consultar el mapa y datos sin registrarse'].map(t => (
                <div key={t} style={{ fontSize: 12, color: 'var(--azul)', paddingLeft: 16, position: 'relative' as const, marginBottom: 8, lineHeight: 1.5 }}>
                  <span style={{ position: 'absolute' as const, left: 0, color: 'var(--verde)' }}>→</span>{t}
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '20px 22px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 10, color: 'var(--rojo)', letterSpacing: 1, marginBottom: 12 }}>✕ NO ESTÁ PERMITIDO</div>
              {['Reportes falsos o inventados', 'Contenido político, partidario o electoral', 'Mencionar personas, funcionarios o instituciones', 'Subir fotos inapropiadas o ajenas al problema', 'Duplicar reportes del mismo problema en la misma zona'].map(t => (
                <div key={t} style={{ fontSize: 12, color: 'var(--azul)', paddingLeft: 16, position: 'relative' as const, marginBottom: 8, lineHeight: 1.5 }}>
                  <span style={{ position: 'absolute' as const, left: 0, color: 'var(--rojo)' }}>✕</span>{t}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, padding: '16px 20px', background: 'rgba(42,157,200,0.06)', border: '1px solid rgba(42,157,200,0.2)', borderLeft: '4px solid var(--celeste)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'var(--celeste)', marginBottom: 6 }}>Moderación</div>
            <p style={{ fontSize: 12, color: 'var(--gris-texto)', lineHeight: 1.7, margin: 0 }}>
              Todos los reportes pasan por revisión del equipo de Conexión Exitosa antes de publicarse. Los reportes que incumplan las normas serán rechazados con un motivo. El vecino recibe un email en ambos casos.
            </p>
          </div>
        </section>

        {/* ── 05 CONTACTO ── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid var(--azul)' }}>
            <span style={{ fontSize: 10, color: 'var(--celeste)', border: '1px solid var(--celeste)', padding: '3px 8px', letterSpacing: 2 }}>05</span>
            <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 800, fontSize: 20, color: 'var(--azul)', margin: 0 }}>Contacto y sugerencias</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="mailto:santarosaenconexion@gmail.com" style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#fff', borderRadius: 'var(--radius)', padding: '18px 20px',
                boxShadow: 'var(--shadow-card)', textDecoration: 'none',
                border: '1px solid var(--gris-borde)',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--celeste-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✉️</div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gris-texto)', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 3 }}>Email</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--azul)' }}>santarosaenconexion@gmail.com</div>
                </div>
              </a>

              <a href="https://instagram.com/_conexionexitosa" target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#fff', borderRadius: 'var(--radius)', padding: '18px 20px',
                boxShadow: 'var(--shadow-card)', textDecoration: 'none',
                border: '1px solid var(--gris-borde)',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gris-texto)', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 3 }}>Instagram</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--azul)' }}>@_conexionexitosa</div>
                </div>
              </a>
            </div>

            <FormContacto />
          </div>
        </section>

      </div>
    </div>
  )
}

export default Acerca