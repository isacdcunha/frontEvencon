<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ nome: '', email: '', senha: '', confirmarSenha: '' })
const erros = reactive({ nome: '', email: '', senha: '', confirmarSenha: '', geral: '' })
const enviando = ref(false)

const senhaValida = computed(
  () =>
    form.senha.length >= 8 &&
    /[a-z]/.test(form.senha) &&
    /[A-Z]/.test(form.senha) &&
    /\d/.test(form.senha),
)

function validar() {
  erros.nome = form.nome.trim() ? '' : 'Informe seu nome.'
  erros.email = EMAIL_VALIDO.test(form.email.trim()) ? '' : 'Informe um e-mail válido.'
  erros.senha = senhaValida.value ? '' : 'A senha não atende aos requisitos.'
  erros.confirmarSenha = form.confirmarSenha === form.senha ? '' : 'As senhas não coincidem.'
  erros.geral = ''

  return !erros.nome && !erros.email && !erros.senha && !erros.confirmarSenha
}

async function criarConta() {
  if (!validar() || enviando.value) return

  enviando.value = true
  try {
    await auth.cadastrar({ nome: form.nome, email: form.email, senha: form.senha })
    router.push({ name: 'home' })
  } catch (erro) {
    erros.geral = erro instanceof Error ? erro.message : 'Não foi possível criar a conta.'
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
        <span class="passo">PASSO 1 DE 3</span>
        <h1>Crie sua conta</h1>
      </div>

      <form novalidate @submit.prevent="criarConta">
        <div class="campo">
          <label for="nome">Nome</label>
          <div class="input-container" :class="{ invalido: erros.nome }">
            <i class="icone fa-regular fa-user"></i>
            <input
              id="nome"
              v-model="form.nome"
              type="text"
              autocomplete="name"
              spellcheck="false"
              placeholder="Qual é seu nome?"
            />
          </div>
          <small v-if="erros.nome" class="erro">{{ erros.nome }}</small>
        </div>

        <div class="campo">
          <label for="email">E-mail</label>
          <div class="input-container" :class="{ invalido: erros.email }">
            <i class="icone fa-regular fa-envelope"></i>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="Exp: voce@email.com"
            />
          </div>
          <small v-if="erros.email" class="erro">{{ erros.email }}</small>
        </div>

        <div class="linha">
          <div class="campo">
            <label for="senha">Senha</label>
            <div class="input-container" :class="{ invalido: erros.senha }">
              <i class="icone fa-solid fa-lock"></i>
              <input
                id="senha"
                v-model="form.senha"
                type="password"
                autocomplete="new-password"
                placeholder="Crie uma senha"
              />
            </div>
          </div>

          <div class="campo">
            <label for="confirmarSenha">Confirmar senha</label>
            <div class="input-container" :class="{ invalido: erros.confirmarSenha }">
              <i class="icone fa-solid fa-lock"></i>
              <input
                id="confirmarSenha"
                v-model="form.confirmarSenha"
                type="password"
                autocomplete="new-password"
                placeholder="Repita a senha"
              />
            </div>
            <small v-if="erros.confirmarSenha" class="erro">{{ erros.confirmarSenha }}</small>
          </div>
        </div>

        <small class="dica" :class="{ erro: erros.senha }">
          Use no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números.
        </small>

        <div class="mensagem">
          <span class="estrela">✦</span>
          <h2>Um universo de experiências começa aqui.</h2>
          <span class="estrela">✦</span>
        </div>

        <p class="termos">
          Ao criar sua conta, você concorda com nossos Termos de Uso e Políticas de Privacidade :)
        </p>

        <p v-if="erros.geral" class="erro-geral" role="alert">{{ erros.geral }}</p>

        <button type="submit" class="botao-enviar" :disabled="enviando">Criar conta</button>
      </form>

      <div class="rodape">
        <span>Já tem conta?</span>
        <RouterLink to="/login">Entrar</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped src="../assets/auth.css"></style>
