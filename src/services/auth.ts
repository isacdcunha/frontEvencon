import type { DadosCadastro, Usuario } from '@/types/usuario'

// Ainda não existe backend: as contas ficam no localStorage deste navegador.
const CHAVE_USUARIOS = 'evencon:usuarios'
const CHAVE_SESSAO = 'evencon:sessao'

interface UsuarioSalvo extends Usuario {
  senhaHash: string
}

function lerUsuarios(): UsuarioSalvo[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIOS) ?? '[]')
  } catch {
    return []
  }
}

function normalizarEmail(email: string) {
  return email.trim().toLowerCase()
}

async function gerarHash(senha: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(senha))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function abrirSessao({ id, nome, email }: UsuarioSalvo): Usuario {
  const usuario = { id, nome, email }
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario))
  return usuario
}

export async function cadastrar(dados: DadosCadastro): Promise<Usuario> {
  const usuarios = lerUsuarios()
  const email = normalizarEmail(dados.email)

  if (usuarios.some((usuario) => usuario.email === email)) {
    throw new Error('Já existe uma conta com esse e-mail.')
  }

  const novo: UsuarioSalvo = {
    id: Math.max(0, ...usuarios.map((usuario) => usuario.id)) + 1,
    nome: dados.nome.trim(),
    email,
    senhaHash: await gerarHash(dados.senha),
  }

  localStorage.setItem(CHAVE_USUARIOS, JSON.stringify([...usuarios, novo]))
  return abrirSessao(novo)
}

export async function entrar(email: string, senha: string): Promise<Usuario> {
  const senhaHash = await gerarHash(senha)
  const usuario = lerUsuarios().find((item) => item.email === normalizarEmail(email))

  if (!usuario || usuario.senhaHash !== senhaHash) {
    throw new Error('E-mail ou senha incorretos.')
  }

  return abrirSessao(usuario)
}

export function sair() {
  localStorage.removeItem(CHAVE_SESSAO)
}

export function buscarSessao(): Usuario | null {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO) ?? 'null')
  } catch {
    return null
  }
}
