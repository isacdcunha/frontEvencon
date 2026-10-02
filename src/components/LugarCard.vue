<script setup lang="ts">
import { computed } from 'vue'
import type { Lugar, LugarProximo } from '@/types/evento'

const props = defineProps<{
  lugar: Lugar | LugarProximo
}>()

const distanciaFormatada = computed(() =>
  'distanciaKm' in props.lugar
    ? `${props.lugar.distanciaKm.toLocaleString('pt-BR')} km do evento`
    : '',
)
</script>

<template>
  <article class="lugar">
    <div class="capa" :style="{ background: lugar.gradiente }">
      <i :class="lugar.icone"></i>
    </div>

    <div class="conteudo">
      <h3>{{ lugar.nome }}</h3>
      <p class="tipo">{{ lugar.tipo }}</p>
      <p class="preco">
        <span v-for="n in 4" :key="n" :class="{ ativo: n <= lugar.faixaPreco }">$</span>
        <template v-if="distanciaFormatada">· {{ distanciaFormatada }}</template>
      </p>
      <p class="status" :class="{ aberto: lugar.aberto }">
        <span class="bolinha"></span>
        {{ lugar.aberto ? 'Aberto' : 'Fechado' }} · {{ lugar.horario }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.lugar {
  background-color: #2a1724;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
  color: white;
}

.capa {
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
}

.conteudo {
  padding: 12px;
}

h3 {
  margin: 0 0 2px;
  font-size: 16px;
}

p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.preco span {
  color: rgba(255, 255, 255, 0.35);
}

.preco span.ativo {
  color: white;
  font-weight: 700;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  font-weight: 600;
}

.status.aberto {
  color: #4ade80;
}

.bolinha {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}
</style>
