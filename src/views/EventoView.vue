<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EventCard from '@/components/EventCard.vue'
import LugarCard from '@/components/LugarCard.vue'
import MapaEvento, { type ResumoRota } from '@/components/MapaEvento.vue'
import { buscarEvento, buscarSemelhantes } from '@/services/eventos'
import type { Evento, EventoDetalhe } from '@/types/evento'

const route = useRoute()
const router = useRouter()

const evento = ref<EventoDetalhe>()
const semelhantes = ref<Evento[]>([])
const carregando = ref(true)
const salvo = ref(false)
const rota = ref<ResumoRota>()

const coresAvatar = ['#ec4899', '#f97316', '#8b5cf6']

async function carregarEvento() {
  carregando.value = true
  salvo.value = false
  rota.value = undefined
  evento.value = await buscarEvento(Number(route.params.id))
  semelhantes.value = evento.value ? await buscarSemelhantes(evento.value) : []
  carregando.value = false
  window.scrollTo({ top: 0 })
}

watch(() => route.params.id, carregarEvento, { immediate: true })

const precoFormatado = computed(() => {
  if (!evento.value) return ''
  return evento.value.preco === 0
    ? 'Grátis'
    : evento.value.preco.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
      })
})

const distanciaFormatada = computed(() =>
  evento.value ? `${evento.value.distanciaKm.toLocaleString('pt-BR')} km` : '',
)

const resumoRota = computed(() => {
  if (!rota.value) return ''
  const distancia = rota.value.distanciaKm.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
  return `${distancia} km · ${rota.value.minutos} min de carro saindo de onde você está`
})

const linkComoChegar = computed(() =>
  evento.value
    ? `https://www.google.com/maps/dir/?api=1&destination=${evento.value.latitude},${evento.value.longitude}`
    : '',
)

function voltar() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

async function compartilhar() {
  const url = window.location.href
  if (navigator.share) {
    await navigator.share({ title: evento.value?.titulo, url }).catch(() => {})
  } else {
    await navigator.clipboard.writeText(url)
  }
}
</script>

<template>
  <main class="pagina">
    <p v-if="carregando" class="estado">Carregando evento...</p>

    <div v-else-if="!evento" class="estado">
      <p>Evento não encontrado.</p>
      <RouterLink to="/">Voltar para o início</RouterLink>
    </div>

    <div v-else class="layout">
      <section class="principal">
        <div class="capa">
          <span class="circulo circulo-grande"></span>
          <span class="circulo circulo-pequeno"></span>
          <i class="icone-capa" :class="evento.icone"></i>

          <button class="botao-redondo voltar" aria-label="Voltar" @click="voltar">
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <div class="acoes-capa">
            <button class="botao-redondo" aria-label="Compartilhar" @click="compartilhar">
              <i class="fa-solid fa-arrow-up-from-bracket"></i>
            </button>
            <button
              class="botao-redondo"
              :class="{ ativo: salvo }"
              :aria-label="salvo ? 'Remover dos salvos' : 'Salvar evento'"
              @click="salvo = !salvo"
            >
              <i :class="salvo ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
            </button>
          </div>

          <span v-if="evento.destaque" class="selo-destaque">
            <i class="fa-solid fa-star"></i> {{ evento.destaque }}
          </span>
        </div>

        <p class="categorias">{{ evento.categorias.join(' · ') }}</p>
        <h1 class="titulo">{{ evento.titulo }}</h1>

        <div class="resumo">
          <div class="resumo-item">
            <span class="resumo-icone"><i class="fa-regular fa-calendar"></i></span>
            <div>
              <strong>{{ evento.dataCompleta }}</strong>
              <p>{{ evento.detalheHorario }}</p>
            </div>
          </div>
          <div class="resumo-item">
            <span class="resumo-icone"><i class="fa-solid fa-location-dot"></i></span>
            <div>
              <strong>{{ evento.local }}</strong>
              <p>{{ evento.endereco }} · {{ distanciaFormatada }} de você</p>
            </div>
          </div>
          <div class="resumo-item">
            <span class="resumo-icone"><i class="fa-regular fa-star"></i></span>
            <div>
              <strong>{{ evento.organizador }}</strong>
              <p>{{ evento.detalheOrganizador }}</p>
            </div>
          </div>
        </div>

        <div class="interesse caixa">
          <div class="avatares">
            <span
              v-for="(nome, i) in evento.amigasInteressadas"
              :key="nome"
              class="avatar"
              :style="{ backgroundColor: coresAvatar[i % coresAvatar.length] }"
              :title="nome"
            >
              {{ nome[0] }}
            </span>
          </div>
          <div>
            <p>
              <strong>{{ evento.interessados }} pessoas</strong> têm interesse
            </p>
            <p v-if="evento.amigasInteressadas.length" class="secundario">
              incluindo {{ evento.amigasInteressadas.length }}
              {{ evento.amigasInteressadas.length === 1 ? 'amiga sua' : 'amigas suas' }}
            </p>
          </div>
        </div>

        <section class="secao">
          <h2>Sobre</h2>
          <p class="sobre">{{ evento.sobre }}</p>
          <ul class="tags">
            <li v-for="tag in evento.tags" :key="tag">#{{ tag }}</li>
          </ul>
        </section>

        <div class="informacoes">
          <div class="informacao caixa">
            <span class="classificacao">{{ evento.classificacao }}</span>
            <div>
              <strong>Classificação</strong>
              <p v-if="evento.classificacao === 'L'">Livre para todos</p>
              <p v-else>Não recomendado &lt; {{ evento.classificacao }}</p>
            </div>
          </div>
          <div v-for="info in evento.informacoes" :key="info.titulo" class="informacao caixa">
            <i :class="info.icone"></i>
            <div>
              <strong>{{ info.titulo }}</strong>
              <p>{{ info.descricao }}</p>
            </div>
          </div>
        </div>

        <section class="secao">
          <h2>Perto daqui</h2>
          <p class="secundario">Para comer ou beber antes ou depois</p>
          <div class="grade">
            <LugarCard v-for="lugar in evento.lugaresProximos" :key="lugar.id" :lugar="lugar" />
          </div>
        </section>

        <section v-if="semelhantes.length" class="secao">
          <h2>Eventos semelhantes</h2>
          <div class="grade">
            <EventCard v-for="item in semelhantes" :key="item.id" :evento="item" />
          </div>
        </section>

        <p class="reportar">
          <i class="fa-solid fa-circle-info"></i>
          Viu algo errado? <a href="#">Reportar evento</a>
        </p>
      </section>

      <aside class="lateral">
        <div class="caixa ingresso">
          <p class="lote">{{ evento.lote }}</p>
          <p class="preco">{{ precoFormatado }}</p>
          <a class="botao-comprar" :href="evento.linkCompra" target="_blank" rel="noopener">
            Comprar no site oficial
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <p class="aviso">
            <i class="fa-solid fa-circle-info"></i>
            Você será levada ao site do organizador
          </p>
          <div class="ingresso-interesse">
            <div class="avatares">
              <span
                v-for="(nome, i) in evento.amigasInteressadas.slice(0, 2)"
                :key="nome"
                class="avatar"
                :style="{ backgroundColor: coresAvatar[i % coresAvatar.length] }"
              >
                {{ nome[0] }}
              </span>
            </div>
            <p>
              <strong>{{ evento.interessados }}</strong> pessoas têm interesse
            </p>
          </div>
        </div>

        <div class="caixa caixa-mapa">
          <MapaEvento
            :latitude="evento.latitude"
            :longitude="evento.longitude"
            :rotulo="evento.local"
            :icone="evento.icone"
            @rota="rota = $event"
          />

          <p class="secundario">{{ evento.endereco }}</p>
          <p class="secundario">
            {{ resumoRota || `${distanciaFormatada} · ${evento.tempoDeCarro}` }}
          </p>

          <a class="botao-chegar" :href="linkComoChegar" target="_blank" rel="noopener">
            <i class="fa-regular fa-paper-plane"></i>
            Como chegar
          </a>
        </div>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.pagina {
  min-height: 100vh;
  background-color: #1f1019;
  color: white;
  font-family: 'DM Sans', sans-serif;
  padding: 24px 16px 48px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 36px;
  max-width: 1160px;
  margin: 0 auto;
  align-items: start;
}

p {
  margin: 0;
}

.caixa {
  background-color: #2a1724;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.secundario {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

/* Capa */
.capa {
  position: relative;
  height: 400px;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(160deg, #8b5cf6, #c084fc 45%, #ec4899);
}

.capa::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 55%, rgba(31, 16, 25, 0.6));
}

.circulo {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.18);
}

.circulo-grande {
  width: 290px;
  height: 290px;
  right: 76px;
  top: 88px;
}

.circulo-pequeno {
  width: 108px;
  height: 108px;
  left: 60px;
  top: 248px;
}

.icone-capa {
  position: absolute;
  right: 140px;
  top: 210px;
  font-size: 72px;
  color: rgba(255, 255, 255, 0.5);
}

.botao-redondo {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: rgba(42, 23, 36, 0.65);
  color: white;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.15s;
}

.botao-redondo:hover {
  transform: scale(1.08);
}

.botao-redondo.ativo {
  color: #f472b6;
}

.voltar {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 1;
}

.acoes-capa {
  position: absolute;
  top: 18px;
  right: 18px;
  display: flex;
  gap: 10px;
  z-index: 1;
}

.selo-destaque {
  position: absolute;
  left: 20px;
  bottom: 16px;
  z-index: 1;
  padding: 4px 10px;
  border: 1px solid rgba(250, 204, 21, 0.5);
  border-radius: 999px;
  background-color: rgba(31, 16, 25, 0.75);
  color: #facc15;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Título e resumo */
.categorias {
  margin-top: 24px;
  color: #f472b6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.titulo {
  max-width: 460px;
  margin: 4px 0 28px;
  font-size: 36px;
  line-height: 1.15;
}

.resumo {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.resumo-item {
  display: flex;
  gap: 14px;
}

.resumo-item p {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.resumo-icone {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: rgba(236, 72, 153, 0.15);
  color: #f472b6;
}

/* Interesse */
.interesse {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  padding: 14px 16px;
  font-size: 14px;
}

.avatares {
  display: flex;
}

.avatar {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #2a1724;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
}

.avatar + .avatar {
  margin-left: -8px;
}

/* Seções */
.secao {
  margin-top: 36px;
}

.secao h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.sobre {
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.tags li {
  padding: 6px 12px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.08);
  font-size: 13px;
  font-weight: 600;
}

.informacoes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 28px;
}

.informacao {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  font-size: 13px;
}

.informacao > i {
  color: #f472b6;
}

.informacao p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.classificacao {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: #facc15;
  color: #1f1019;
  font-weight: 700;
}

.grade {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 14px;
}

.reportar {
  margin-top: 36px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.reportar a {
  color: #f472b6;
  font-weight: 700;
  text-decoration: none;
}

/* Lateral */
.lateral {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ingresso {
  padding: 22px;
}

.lote {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preco {
  margin: 2px 0 16px;
  font-size: 34px;
  font-weight: 700;
}

.botao-comprar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 48px;
  border-radius: 999px;
  background: linear-gradient(90deg, #db2777, #a855f7);
  box-shadow: 0 8px 24px rgba(219, 39, 119, 0.35);
  color: white;
  font-weight: 700;
  text-decoration: none;
  transition: filter 0.2s;
}

.botao-comprar:hover {
  filter: brightness(1.1);
}

.aviso {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  text-align: center;
}

.ingresso-interesse {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
}

.caixa-mapa {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px;
}

.caixa-mapa .mapa {
  margin-bottom: 12px;
}

.botao-chegar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 38px;
  margin-top: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
}

.botao-chegar:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

/* Telas menores */
@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .lateral {
    position: static;
  }

  .resumo,
  .grade {
    grid-template-columns: 1fr;
  }

  .informacoes {
    grid-template-columns: repeat(2, 1fr);
  }

  .capa {
    height: 260px;
  }

  .circulo-grande {
    width: 180px;
    height: 180px;
    right: 20px;
    top: 50px;
  }

  .icone-capa {
    right: 75px;
    top: 115px;
    font-size: 48px;
  }

  .titulo {
    font-size: 28px;
  }
}
</style>
