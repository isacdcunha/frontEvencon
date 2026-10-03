// Endereço do back-end (repositório backEvencon). Para trocar, crie um .env.local.
const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const CHAVE_TOKEN = 'evencon:token'

export class ErroApi extends Error {
  constructor(
    mensagem: string,
    public status: number,
  ) {
    super(mensagem)
  }
}

export function lerToken() {
  return localStorage.getItem(CHAVE_TOKEN)
}

export function guardarToken(token: string | null) {
  if (token) localStorage.setItem(CHAVE_TOKEN, token)
  else localStorage.removeItem(CHAVE_TOKEN)
}

export async function chamarApi<T>(
  caminho: string,
  opcoes: { metodo?: string; corpo?: unknown } = {},
): Promise<T> {
  const token = lerToken()
  let resposta: Response

  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      method: opcoes.metodo ?? 'GET',
      headers: {
        ...(opcoes.corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
    })
  } catch {
    throw new ErroApi('Não foi possível falar com o servidor. Verifique se ele está no ar.', 0)
  }

  if (!resposta.ok) {
    // o back manda a mensagem pronta em "detail"; erros de validação (422) vêm como lista
    const dados = await resposta.json().catch(() => null)
    const mensagem =
      typeof dados?.detail === 'string' ? dados.detail : 'Confira os dados e tente de novo.'
    throw new ErroApi(mensagem, resposta.status)
  }

  return resposta.status === 204 ? (undefined as T) : resposta.json()
}
