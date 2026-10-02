import type { Evento, EventoDetalhe, Lugar } from '@/types/evento'

// Endereço do back-end (repositório backEvencon). Para trocar, crie um .env.local.
const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function chamarApi(caminho: string) {
  const resposta = await fetch(`${URL_API}${caminho}`)
  if (!resposta.ok && resposta.status !== 404) {
    throw new Error(`A API respondeu ${resposta.status} em ${caminho}`)
  }
  return resposta
}

export async function listarEventos(): Promise<Evento[]> {
  return (await chamarApi('/eventos')).json()
}

export async function listarLugares(): Promise<Lugar[]> {
  return (await chamarApi('/lugares')).json()
}

export async function buscarEvento(id: number): Promise<EventoDetalhe | undefined> {
  const resposta = await chamarApi(`/eventos/${id}`)
  return resposta.ok ? resposta.json() : undefined
}

export async function buscarSemelhantes(evento: EventoDetalhe, limite = 3): Promise<Evento[]> {
  const resposta = await chamarApi(`/eventos/${evento.id}/semelhantes?limite=${limite}`)
  return resposta.ok ? resposta.json() : []
}
