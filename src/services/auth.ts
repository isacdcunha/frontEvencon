import { chamarApi, ErroApi, guardarToken, lerToken } from '@/services/api'
import type { DadosCadastro, Usuario } from '@/types/usuario'

// As contas ficam no back-end. O navegador guarda só o token do login e uma cópia
// dos dados da conta, para a tela não piscar como "sem conta" ao recarregar.
const CHAVE_USUARIO = 'evencon:sessao'

interface SessaoAberta {
  token: string
  usuario: Usuario
}

function guardarUsuario(usuario: Usuario | null) {
  if (usuario) localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario))
  else localStorage.removeItem(CHAVE_USUARIO)
  return usuario
}

function abrirSessao({ token, usuario }: SessaoAberta) {
  guardarToken(token)
  return guardarUsuario(usuario)!
}

function encerrarSessao() {
  guardarToken(null)
  guardarUsuario(null)
}

export async function cadastrar(dados: DadosCadastro): Promise<Usuario> {
  return abrirSessao(await chamarApi('/auth/cadastro', { metodo: 'POST', corpo: dados }))
}

export async function entrar(email: string, senha: string): Promise<Usuario> {
  return abrirSessao(await chamarApi('/auth/login', { metodo: 'POST', corpo: { email, senha } }))
}

export function usuarioEmCache(): Usuario | null {
  if (!lerToken()) return null
  try {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIO) ?? 'null')
  } catch {
    return null
  }
}

/** Confere com o servidor se o login guardado ainda vale. */
export async function buscarSessao(): Promise<Usuario | null> {
  if (!lerToken()) return null
  try {
    return guardarUsuario(await chamarApi<Usuario>('/auth/eu'))
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 401) {
      encerrarSessao()
      return null
    }
    throw erro
  }
}

export async function atualizarInteresses(interesses: string[]): Promise<Usuario> {
  return guardarUsuario(
    await chamarApi<Usuario>('/auth/eu/interesses', { metodo: 'PUT', corpo: { interesses } }),
  )!
}

export function sair() {
  // avisa o servidor (se ele estiver fora do ar, o login local sai do mesmo jeito)
  chamarApi('/auth/sair', { metodo: 'POST' }).catch(() => {})
  encerrarSessao()
}
