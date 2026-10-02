import { eventos } from '@/data/eventos'
import type { Evento, EventoDetalhe, LugarProximo } from '@/types/evento'

export async function listarEventos(): Promise<Evento[]> {
  return eventos
}

export async function listarLugares(): Promise<LugarProximo[]> {
  const lugares = new Map<number, LugarProximo>()
  eventos.forEach((evento) =>
    evento.lugaresProximos.forEach((lugar) => lugares.set(lugar.id, lugar)),
  )
  return [...lugares.values()]
}

export async function buscarEvento(id: number): Promise<EventoDetalhe | undefined> {
  return eventos.find((evento) => evento.id === id)
}

export async function buscarSemelhantes(evento: EventoDetalhe, limite = 3): Promise<Evento[]> {
  const outros = eventos.filter((item) => item.id !== evento.id)

  const emComum = (item: Evento) =>
    item.categorias.filter((categoria) => evento.categorias.includes(categoria)).length

  return outros.sort((a, b) => emComum(b) - emComum(a)).slice(0, limite)
}
