export interface Usuario {
  id: number
  nome: string
  email: string
  interesses: string[]
  admin: boolean
}

export interface DadosCadastro {
  nome: string
  email: string
  senha: string
}
