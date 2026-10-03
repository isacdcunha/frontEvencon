import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/auth'
import type { DadosCadastro, Usuario } from '@/types/usuario'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref<Usuario | null>(authService.usuarioEmCache())
  const logado = computed(() => usuario.value !== null)
  const admin = computed(() => usuario.value?.admin === true)

  async function cadastrar(dados: DadosCadastro) {
    usuario.value = await authService.cadastrar(dados)
  }

  async function entrar(email: string, senha: string) {
    usuario.value = await authService.entrar(email, senha)
  }

  async function atualizarInteresses(interesses: string[]) {
    if (!usuario.value) return
    usuario.value = await authService.atualizarInteresses(interesses)
  }

  function sair() {
    authService.sair()
    usuario.value = null
  }

  // Ao abrir o site, confere se o login guardado ainda vale e atualiza os dados da conta.
  authService
    .buscarSessao()
    .then((atual) => (usuario.value = atual))
    .catch(() => {
      // servidor fora do ar: segue com o que estava guardado
    })

  return { usuario, logado, admin, cadastrar, entrar, atualizarInteresses, sair }
})
