<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav style="display: flex; gap: 1rem; padding: 1rem">
    <RouterLink to="/">Início</RouterLink>
    <RouterLink to="/login">Login</RouterLink>
    <RouterLink to="/cadastro">Cadastro</RouterLink>
    <RouterLink to="/explorar">Explorar</RouterLink>
    <RouterLink to="/salvos">Salvos</RouterLink>
    <RouterLink to="/perfil">Perfil</RouterLink>
  </nav>

  <RouterView />
</template>