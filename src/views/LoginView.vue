<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', senha: '' })
const erro = ref('')
const enviando = ref(false)

async function entrar() {
  if (enviando.value) return

  if (!form.email.trim() || !form.senha) {
    erro.value = 'Informe seu e-mail e sua senha.'
    return
  }

  enviando.value = true
  erro.value = ''
  try {
    await auth.entrar(form.email, form.senha)
    router.push({ name: 'home' })
  } catch (falha) {
    erro.value = falha instanceof Error ? falha.message : 'Não foi possível entrar.'
  } finally {
    enviando.value = false
  }
}

function voltar() {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <main class="auth">
    <button type="button" class="botao-voltar" aria-label="Voltar" @click="voltar">
      <i class="fa-solid fa-arrow-left"></i>
    </button>

    <div class="conteudo">
      <div class="cabecalho">
        <h1>Entre na sua conta</h1>
        <p>Que bom ter você de volta.</p>
      </div>

      <form novalidate @submit.prevent="entrar">
        <div class="campo">
          <label for="email">E-mail</label>
          <div class="input-container">
            <i class="icone fa-regular fa-envelope"></i>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="Exp: voce@email.com"
            />
          </div>
        </div>

        <div class="campo">
          <label for="senha">Senha</label>
          <div class="input-container">
            <i class="icone fa-solid fa-lock"></i>
            <input
              id="senha"
              v-model="form.senha"
              type="password"
              autocomplete="current-password"
              placeholder="Sua senha"
            />
          </div>
        </div>

        <p v-if="erro" class="erro-geral" role="alert">{{ erro }}</p>

        <button type="submit" class="botao-enviar" :disabled="enviando">Entrar</button>
      </form>

      <div class="rodape">
        <span>Ainda não tem conta?</span>
        <RouterLink to="/cadastro">Criar conta</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped src="../assets/auth.css"></style>
