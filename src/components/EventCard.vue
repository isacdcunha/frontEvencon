<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useSalvosStore } from '@/stores/salvos'
import type { Evento } from '@/types/evento'

const props = defineProps<{
  evento: Evento
}>()

const salvos = useSalvosStore()
const salvo = computed(() => salvos.tem(props.evento.id))

const gratis = computed(() => props.evento.preco === 0)

const precoFormatado = computed(() =>
  gratis.value
    ? 'Grátis'
    : props.evento.preco.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
      }),
)

const distanciaFormatada = computed(() => `${props.evento.distanciaKm.toLocaleString('pt-BR')} km`)
</script>

<template>
  <RouterLink :to="{ name: 'evento', params: { id: evento.id } }" class="card">
    <div class="capa">
      <span class="circulo circulo-grande"></span>
      <span class="circulo circulo-pequeno"></span>

      <span v-if="gratis" class="selo">Grátis</span>

      <button
        class="botao-salvar"
        :class="{ ativo: salvo }"
        :aria-label="salvo ? 'Remover dos salvos' : 'Salvar evento'"
        @click.prevent.stop="salvos.alternar(evento.id)"
      >
        <i :class="salvo ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
      </button>

      <i class="icone-categoria" :class="evento.icone"></i>
    </div>

    <div class="conteudo">
      <p class="categorias">{{ evento.categorias.join(' · ') }}</p>
      <h3 class="titulo">{{ evento.titulo }}</h3>

      <p class="info">
        <i class="fa-regular fa-calendar"></i>
        {{ evento.data }}
      </p>
      <p class="info">
        <i class="fa-solid fa-location-dot"></i>
        {{ evento.local }}
      </p>

      <div class="rodape">
        <div>
          <span class="rotulo-preco">{{ evento.rotuloPreco }}</span>
          <strong class="preco" :class="{ gratis }">{{ precoFormatado }}</strong>
        </div>
        <span class="distancia">{{ distanciaFormatada }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background-color: #2a1724;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
  color: white;
  text-decoration: none;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-3px);
}

.capa {
  position: relative;
  height: 125px;
  background: linear-gradient(135deg, #f472b6, #db2777 50%, #c026d3);
  overflow: hidden;
}

.circulo {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
}

.circulo-grande {
  width: 90px;
  height: 90px;
  top: -30px;
  left: -25px;
}

.circulo-pequeno {
  width: 34px;
  height: 34px;
  top: 18px;
  right: 60px;
}

.selo {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background-color: white;
  color: #2a1724;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.botao-salvar {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: rgba(42, 23, 36, 0.7);
  color: white;
  cursor: pointer;
  transition: transform 0.15s;
}

.botao-salvar:hover {
  transform: scale(1.1);
}

.botao-salvar.ativo {
  color: #f472b6;
}

.icone-categoria {
  position: absolute;
  right: 20px;
  bottom: 18px;
  font-size: 34px;
  color: rgba(255, 255, 255, 0.55);
}

.conteudo {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px 14px 14px;
}

.categorias {
  margin: 0 0 6px;
  color: #f472b6;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.titulo {
  margin: 0 0 10px;
  font-size: 17px;
  line-height: 1.25;
}

.info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.info i {
  width: 14px;
  font-size: 13px;
}

.rodape {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.rotulo-preco {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.preco {
  font-size: 18px;
}

.preco.gratis {
  color: #4ade80;
}

.distancia {
  padding: 4px 10px;
  border-radius: 999px;
  background-color: rgba(236, 72, 153, 0.18);
  color: #f472b6;
  font-size: 12px;
  font-weight: 600;
}
</style>
