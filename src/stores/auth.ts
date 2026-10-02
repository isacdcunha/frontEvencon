import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/auth'
import type { DadosCadastro, Usuario } from '@/types/usuario'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref<Usuario | null>(authService.buscarSessao())
  const logado = computed(() => usuario.value !== null)

  async function cadastrar(dados: DadosCadastro) {
    usuario.value = await authService.cadastrar(dados)
  }

  async function entrar(email: string, senha: string) {
    usuario.value = await authService.entrar(email, senha)
  }

  function sair() {
    authService.sair()
    usuario.value = null
  }

  return { usuario, logado, cadastrar, entrar, sair }
})
