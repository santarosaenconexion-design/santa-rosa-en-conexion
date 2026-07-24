// Mismos límites que usaba Reportar.tsx del lado del cliente (LIMITES),
// ahora también aplicados server-side para que no se puedan saltear.
export const LIMITES_SANTA_ROSA = { latMin: -36.70, latMax: -36.55, lngMin: -64.35, lngMax: -64.20 }

export function dentroDeSantaRosa(lat, lng) {
  const l = LIMITES_SANTA_ROSA
  return lat >= l.latMin && lat <= l.latMax && lng >= l.lngMin && lng <= l.lngMax
}
