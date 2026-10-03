import { chamarApi, ErroApi } from '@/services/api'
import type { Evento, EventoDetalhe, Lugar, NovoEvento } from '@/types/evento'

export function listarEventos() {
  return chamarApi<Evento[]>('/eventos')
}

export function listarLugares() {
  return chamarApi<Lugar[]>('/lugares')
}

export async function buscarEvento(id: number): Promise<EventoDetalhe | undefined> {
  try {
    return await chamarApi<EventoDetalhe>(`/eventos/${id}`)
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 404) return undefined
    throw erro
  }
}

export function buscarSemelhantes(evento: EventoDetalhe, limite = 3) {
  return chamarApi<Evento[]>(`/eventos/${evento.id}/semelhantes?limite=${limite}`)
}

// As duas funções abaixo só funcionam para quem está logada como administradora.
export function criarEvento(evento: NovoEvento) {
  return chamarApi<EventoDetalhe>('/eventos', { metodo: 'POST', corpo: evento })
}

export function apagarEvento(id: number) {
  return chamarApi<void>(`/eventos/${id}`, { metodo: 'DELETE' })
}
