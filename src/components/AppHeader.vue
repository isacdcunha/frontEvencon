<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// A busca de verdade fica no Explorar: aqui a barra só leva até lá, já com o campo em foco.
function irParaExplorar() {
  router.push({ name: 'explorar', state: { focarBusca: true } })
}
</script>

<template>
  <header>
    <nav class="menu">
      <img src="/imgs/evencon-horizontal-branco.png" alt="Evencon" />
      <RouterLink to="/"><i class="fa-regular fa-house"></i> Início</RouterLink>
      <RouterLink to="/explorar"><i class="fa-solid fa-magnifying-glass"></i> Explorar</RouterLink>
      <RouterLink to="/perfil"><i class="fa-regular fa-heart"></i> Salvos</RouterLink>
    </nav>

    <button v-if="route.name !== 'explorar'" type="button" class="busca" @click="irParaExplorar">
      <i class="fa-solid fa-magnifying-glass"></i>
      Buscar evento, lugar ou artista
    </button>

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
  color: rgba(255, 255, 255, 0.5);
  font-family: inherit;
  font-size: 15px;
  text-align: left;
  cursor: text;
  transition: border-color 0.2s;
}

.busca:hover,
.busca:focus-visible {
  border-color: #f472b6;
  outline: none;
}
</style>
