export interface Evento {
  id: number
  titulo: string
  categorias: string[]
  data: string
  /** Data e hora de início no formato ISO, usada para filtrar e ordenar */
  inicio: string
  local: string
  preco: number
  rotuloPreco: string
  distanciaKm: number
  icone: string
  destaque?: string
  bairro: string
  acessivel: boolean
  petFriendly: boolean
  paraFamilia: boolean
}

export interface InfoEvento {
  icone: string
  titulo: string
  descricao: string
}

export interface Lugar {
  id: number
  nome: string
  tipo: string
  faixaPreco: number
  aberto: boolean
  horario: string
  icone: string
  gradiente: string
  categoria: string
  bairro: string
  acessivel: boolean
  petFriendly: boolean
  paraFamilia: boolean
}

/** Lugar perto de um evento, com a distância entre os dois */
export interface LugarProximo extends Lugar {
  distanciaKm: number
}

export interface EventoDetalhe extends Evento {
  dataCompleta: string
  detalheHorario: string
  endereco: string
  latitude: number
  longitude: number
  organizador: string
  detalheOrganizador: string
  interessados: number
  amigasInteressadas: string[]
  sobre: string
  tags: string[]
  informacoes: InfoEvento[]
  classificacao: string
  lote: string
  linkCompra: string
  tempoDeCarro: string
  lugaresProximos: LugarProximo[]
}
