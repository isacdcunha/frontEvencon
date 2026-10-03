import { ref } from 'vue'
import { defineStore } from 'pinia'

// A escolha fica guardada neste navegador. As telas ainda não usam as coordenadas
// para calcular distâncias: por enquanto só registramos o que a pessoa decidiu.
const CHAVE = 'evencon:localizacao'

export interface Localizacao {
  permitida: boolean
  latitude?: number
  longitude?: number
}

function ler(): Localizacao | null {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? 'null')
  } catch {
    return null
  }
}

export const useLocalizacaoStore = defineStore('localizacao', () => {
  const localizacao = ref<Localizacao | null>(ler())

  function guardar(nova: Localizacao) {
    localizacao.value = nova
    localStorage.setItem(CHAVE, JSON.stringify(nova))
  }

  /** Pede a localização ao navegador. Rejeita com uma mensagem pronta para mostrar na tela. */
  function permitir() {
    return new Promise<void>((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Seu navegador não permite obter a localização.'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          guardar({ permitida: true, latitude: coords.latitude, longitude: coords.longitude })
          resolve()
        },
        (falha) =>
          reject(
            new Error(
              falha.code === falha.PERMISSION_DENIED
                ? 'A localização está bloqueada para este site. Libere nas permissões do navegador ou siga sem ela.'
                : 'Não foi possível obter sua localização agora.',
            ),
          ),
        { timeout: 10000 },
      )
    })
  }

  function recusar() {
    guardar({ permitida: false })
  }

  return { localizacao, permitir, recusar }
})
