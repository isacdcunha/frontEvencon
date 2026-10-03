<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const route = useRoute()
</script>

<template>
  <AppHeader />

  <div v-if="auth.admin && route.name !== 'novo-evento'" class="faixa-admin">
    <span class="selo"><i class="fa-solid fa-shield-halved"></i> Admin</span>
    <span class="texto">
      Você está no <b>modo administradora</b>: pode adicionar e apagar eventos.
    </span>
    <RouterLink :to="{ name: 'novo-evento' }"
      ><i class="fa-solid fa-plus"></i> Novo evento</RouterLink
    >
  </div>

  <RouterView />
</template>

<style scoped>
.faixa-admin {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(167, 139, 250, 0.3);
  background-color: #2b1a3d;
  color: rgba(255, 255, 255, 0.75);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}

.faixa-admin b {
  color: white;
}

.selo {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  background-color: #7c3aed;
  color: white;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.faixa-admin a {
  color: #f472b6;
  font-weight: 700;
  text-decoration: none;
}

.faixa-admin a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .texto {
    display: none;
  }
}
</style>
