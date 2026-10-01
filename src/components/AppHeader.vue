<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const termo = ref(typeof route.query.q === 'string' ? route.query.q : '')

watch(
  () => route.query.q,
  (q) => {
    termo.value = typeof q === 'string' ? q : ''
  },
)

function montarQuery() {
  return termo.value.trim() ? { q: termo.value } : {}
}

function irParaExplorar() {
  if (route.name !== 'explorar') {
    router.push({ name: 'explorar', query: montarQuery() })
  }
}

function atualizarBusca() {
  router.replace({ name: 'explorar', query: montarQuery() })
}
</script>

<template>
  <header>
    <nav class="menu">
      <img src="/imgs/evencon-horizontal-branco.png" alt="Evencon" />
      <RouterLink to="/"><i class="fa-regular fa-house"></i> Início</RouterLink>
      <RouterLink to="/explorar"><i class="fa-solid fa-magnifying-glass"></i> Explorar</RouterLink>
      <RouterLink to="/cadastro"><i class="fa-solid fa-wand-magic-sparkles"></i> Seu momento</RouterLink>
      <RouterLink to="/salvos"><i class="fa-regular fa-heart"></i> Salvos</RouterLink>
    </nav>

    <form class="busca" role="search" @submit.prevent="atualizarBusca">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input
        v-model="termo"
        type="search"
        placeholder="Buscar evento, lugar ou artista"
        aria-label="Buscar evento, lugar ou artista"
        @focus="irParaExplorar"
        @input="atualizarBusca"
      />
    </form>

    <RouterLink to="/perfil" class="avatar" aria-label="Meu perfil">
      <i class="fa-solid fa-user"></i>
    </RouterLink>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');

header {
  background-color: #2e0a1e;
  height: 80px;
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 0 20px;
  font-family: 'DM Sans', sans-serif;
}

.menu a {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.menu a:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.menu a.router-link-exact-active {
  background-color: rgba(236, 72, 153, 0.18);
  color: #f472b6;
}

.avatar {
  margin-left: auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ec4899, #c026d3);
  color: white;
  text-decoration: none;
  transition: box-shadow 0.2s;
}

.avatar:hover,
.avatar.router-link-exact-active {
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.35);
}

.menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu img {
  height: 40px;
}

.busca {
  flex: 1;
  max-width: 380px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  transition: border-color 0.2s;
}

.busca:focus-within {
  border-color: #f472b6;
}

.busca input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: white;
  font-family: inherit;
  font-size: 15px;
}

.busca input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}
</style>
