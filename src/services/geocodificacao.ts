// Descobre as coordenadas de um endereço no OpenStreetMap (serviço Nominatim, sem chave).
const URL_BUSCA = 'https://nominatim.openstreetmap.org/search'

// Praça da Bandeira, usada como "centro" para estimar a distância mostrada nos cards
const CENTRO = { latitude: -26.3045, longitude: -48.8487 }

export interface Coordenadas {
  latitude: number
  longitude: number
}

export async function buscarCoordenadas(endereco: string): Promise<Coordenadas | null> {
  const consulta = new URLSearchParams({
    q: `${endereco}, Joinville, SC, Brasil`,
    format: 'json',
    limit: '1',
  })
  const resposta = await fetch(`${URL_BUSCA}?${consulta}`)
  if (!resposta.ok) return null

  const [resultado]: { lat: string; lon: string }[] = await resposta.json()
  return resultado ? { latitude: Number(resultado.lat), longitude: Number(resultado.lon) } : null
}

/** Distância em linha reta até o centro da cidade, em km com uma casa decimal. */
export function distanciaDoCentro({ latitude, longitude }: Coordenadas) {
  const rad = (graus: number) => (graus * Math.PI) / 180
  const dLat = rad(latitude - CENTRO.latitude)
  const dLng = rad(longitude - CENTRO.longitude)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(CENTRO.latitude)) * Math.cos(rad(latitude)) * Math.sin(dLng / 2) ** 2
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(a)) * 10) / 10
}
