<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import EventCard from '@/components/EventCard.vue'
import LugarCard from '@/components/LugarCard.vue'
import { listarEventos, listarLugares } from '@/services/eventos'
import { useAuthStore } from '@/stores/auth'
import type { Evento, Lugar } from '@/types/evento'

const auth = useAuthStore()

const eventos = ref<Evento[]>([])
const lugares = ref<Lugar[]>([])
const pronto = ref(false)
const erro = ref(false)

onMounted(async () => {
  try {
    ;[eventos.value, lugares.value] = await Promise.all([listarEventos(), listarLugares()])
    pronto.value = true
  } catch {
    erro.value = true
  }
})

const agora = new Date()

const atalhos = [
  { rotulo: 'Para você', icone: 'fa-solid fa-wand-magic-sparkles', filtro: {} },
  { rotulo: 'Hoje', filtro: { data: 'hoje' } },
  { rotulo: 'Este fim de semana', filtro: { data: 'fds' } },
  { rotulo: 'Grátis', filtro: { preco: 'gratis' } },
  {
    rotulo: 'Perto de mim',
    icone: 'fa-solid fa-location-crosshairs',
    filtro: { ordem: 'proximos' },
  },
  { rotulo: 'Música', icone: 'fa-solid fa-music', filtro: { categoria: 'Música' } },
  { rotulo: 'Bares', icone: 'fa-solid fa-beer-mug-empty', filtro: { categoria: 'Bares' } },
  { rotulo: 'Ao ar livre', icone: 'fa-solid fa-tree', filtro: { categoria: 'Ao ar livre' } },
]

function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate())
}

function somarDias(data: Date, dias: number) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias)
}

function formatarDia(data: Date) {
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

const sabado = somarDias(agora, agora.getDay() === 0 ? -1 : 6 - agora.getDay())
const domingo = somarDias(sabado, 1)

function aconteceEntre(evento: Evento, de: Date, ate: Date) {
  const inicio = new Date(evento.inicio)
  return inicio >= de && inicio < ate
}

const saudacao = computed(() => {
  const hora = agora.getHours()
  const periodo = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const nome = auth.usuario?.nome.split(' ')[0]
  return nome ? `${periodo}, ${nome}. O que vai ser hoje?` : `${periodo}! O que vai ser hoje?`
})

const proximos = computed(() =>
  eventos.value
    .filter((evento) => new Date(evento.inicio) >= inicioDoDia(agora))
    .sort((a, b) => a.inicio.localeCompare(b.inicio)),
)

const destaque = computed(() => proximos.value.find((evento) => evento.destaque))

const paraVoce = computed(() =>
  proximos.value.filter((evento) => evento.id !== destaque.value?.id).slice(0, 4),
)

const hoje = computed(() =>
  proximos.value.filter((evento) => aconteceEntre(evento, inicioDoDia(agora), somarDias(agora, 1))),
)

const gratisNoFimDeSemana = computed(() =>
  proximos.value.filter(
    (evento) => evento.preco === 0 && aconteceEntre(evento, sabado, somarDias(domingo, 1)),
  ),
)

const lugaresAbertos = computed(() => lugares.value.filter((lugar) => lugar.aberto).slice(0, 4))

const rotuloFimDeSemana = computed(() => {
  const mes = domingo.toLocaleDateString('pt-BR', { month: 'long' })
  return sabado.getMonth() === domingo.getMonth()
    ? `Sábado ${sabado.getDate()} e domingo ${domingo.getDate()} de ${mes}`
    : `Sábado ${sabado.getDate()} e domingo ${domingo.getDate()}`
})
</script>

<template>
  <main class="pagina">
    <div class="conteudo">
      <header class="saudacao">
        <p class="sobretitulo">{{ formatarDia(agora) }}</p>
        <h1>{{ saudacao }}</h1>
      </header>

      <p v-if="erro" class="vazio" role="alert">
        Não foi possível carregar os eventos. Verifique se o servidor está no ar e recarregue a
        página.
      </p>

      <RouterLink
        v-if="destaque"
        :to="{ name: 'evento', params: { id: destaque.id } }"
        class="destaque"
      >
        <span class="circulo circulo-grande"></span>
        <span class="circulo circulo-pequeno"></span>
        <i class="icone-destaque" :class="destaque.icone"></i>

        <div class="destaque-texto">
          <span class="selo-destaque">
            <i class="fa-solid fa-star"></i> {{ destaque.destaque }}
          </span>
          <p class="sobretitulo claro">{{ destaque.categorias.join(' · ') }}</p>
          <h2>{{ destaque.titulo }}</h2>
          <p class="destaque-info">
            <span><i class="fa-regular fa-calendar"></i> {{ destaque.data }}</span>
            <span>
              <i class="fa-solid fa-location-dot"></i>
              {{ destaque.local }} · {{ destaque.distanciaKm.toLocaleString('pt-BR') }} km
            </span>
          </p>
          <span class="botao-destaque">Ver evento</span>
        </div>
      </RouterLink>

      <nav class="atalhos" aria-label="Atalhos de busca">
        <RouterLink
          v-for="(atalho, i) in atalhos"
          :key="atalho.rotulo"
          :to="{ name: 'explorar', query: atalho.filtro }"
          class="atalho"
          :class="{ ativo: i === 0 }"
        >
          <i v-if="atalho.icone" :class="atalho.icone"></i>
          {{ atalho.rotulo }}
        </RouterLink>
      </nav>

      <section>
        <div class="cabecalho-secao">
          <div>
            <h2>Para você</h2>
            <p>Os próximos eventos perto de você</p>
          </div>
          <RouterLink to="/explorar">Ver tudo</RouterLink>
        </div>
        <div v-if="paraVoce.length" class="grade grade-4">
          <EventCard v-for="evento in paraVoce" :key="evento.id" :evento="evento" />
        </div>
        <p v-else-if="pronto" class="vazio">Ainda não há eventos por aqui.</p>
      </section>

      <div class="dividido">
        <section>
          <div class="cabecalho-secao">
            <div>
              <h2>Acontecendo hoje</h2>
              <p class="capitalizado">{{ formatarDia(agora) }}</p>
            </div>
            <RouterLink :to="{ name: 'explorar', query: { data: 'hoje' } }">Ver tudo</RouterLink>
          </div>
          <div v-if="hoje.length" class="grade grade-2">
            <EventCard v-for="evento in hoje.slice(0, 2)" :key="evento.id" :evento="evento" />
          </div>
          <p v-else-if="pronto" class="vazio">Nenhum evento marcado para hoje.</p>
        </section>

        <section>
          <div class="cabecalho-secao">
            <div>
              <h2>Onde ir: bares e restaurantes</h2>
              <p>Abertos agora</p>
            </div>
            <RouterLink :to="{ name: 'explorar', query: { tipo: 'lugares' } }">Ver tudo</RouterLink>
          </div>
          <div v-if="lugaresAbertos.length" class="grade grade-2">
            <LugarCard v-for="lugar in lugaresAbertos" :key="lugar.id" :lugar="lugar" />
          </div>
          <p v-else-if="pronto" class="vazio">Nenhum lugar aberto agora.</p>
        </section>
      </div>

      <RouterLink to="/cadastro" class="momento">
        <span class="circulo circulo-momento-1"></span>
        <span class="circulo circulo-momento-2"></span>
        <img src="/imgs/evencon-icone.png" alt="" />
        <div>
          <p class="sobretitulo claro">Seu momento</p>
          <h3>Não sabe o que fazer hoje?</h3>
          <p>4 perguntas rápidas e a gente sugere.</p>
        </div>
        <span class="botao-momento">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Fazer o quiz
        </span>
      </RouterLink>

      <section>
        <div class="cabecalho-secao">
          <div>
            <h2>Grátis este fim de semana</h2>
            <p>{{ rotuloFimDeSemana }}</p>
          </div>
          <RouterLink :to="{ name: 'explorar', query: { data: 'fds', preco: 'gratis' } }">
            Ver tudo
          </RouterLink>
        </div>
        <div v-if="gratisNoFimDeSemana.length" class="grade grade-4">
          <EventCard v-for="evento in gratisNoFimDeSemana" :key="evento.id" :evento="evento" />
        </div>
        <p v-else-if="pronto" class="vazio">Nenhum evento grátis neste fim de semana.</p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.pagina {
  min-height: calc(100vh - 80px);
  background-color: #1f1019;
  color: white;
  font-family: 'DM Sans', sans-serif;
  padding: 28px 16px 64px;
}

.conteudo {
  display: flex;
  flex-direction: column;
  gap: 36px;
  max-width: 1160px;
  margin: 0 auto;
}

p,
h1,
h2,
h3 {
  margin: 0;
}

.sobretitulo {
  color: rgba(255, 255, 255, 0.55);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.sobretitulo.claro {
  color: rgba(255, 255, 255, 0.9);
}

.saudacao h1 {
  margin-top: 6px;
  font-size: 32px;
}

.circulo {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
}

/* Destaque */
.destaque {
  position: relative;
  display: block;
  min-height: 320px;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(135deg, #f472b6, #db2777 50%, #c026d3);
  color: white;
  text-decoration: none;
}

.destaque::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(31, 16, 25, 0.9) 0%,
    rgba(31, 16, 25, 0.6) 45%,
    rgba(31, 16, 25, 0) 75%
  );
}

.circulo-grande {
  width: 38%;
  aspect-ratio: 1;
  top: -20%;
  left: -8%;
}

.circulo-pequeno {
  width: 14%;
  aspect-ratio: 1;
  top: 58%;
  left: 74%;
}

.icone-destaque {
  position: absolute;
  right: 10%;
  bottom: 22%;
  font-size: 130px;
  color: rgba(255, 255, 255, 0.35);
}

.destaque-texto {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  max-width: 560px;
  padding: 44px;
}

.destaque-texto h2 {
  font-size: 40px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.selo-destaque {
  padding: 4px 10px;
  border: 1px solid rgba(251, 191, 36, 0.35);
  border-radius: 999px;
  background-color: rgba(31, 16, 25, 0.85);
  color: #fbbf24;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.destaque-info {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  font-size: 15px;
}

.botao-destaque {
  margin-top: 6px;
  padding: 14px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #db2777, #a855f7);
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 12px 32px -10px rgba(236, 72, 153, 0.7);
  transition: filter 0.2s;
}

.destaque:hover .botao-destaque {
  filter: brightness(1.1);
}

/* Atalhos */
.atalhos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.atalho {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background-color: #2a1724;
  color: white;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.2s;
}

.atalho:hover {
  border-color: #f472b6;
}

.atalho.ativo {
  border-color: #ec4899;
  background-color: #ec4899;
  color: #2a0a1c;
}

/* Seções */
.cabecalho-secao {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.cabecalho-secao h2 {
  font-size: 20px;
}

.cabecalho-secao p {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
}

.capitalizado::first-letter {
  text-transform: uppercase;
}

.cabecalho-secao a {
  color: #f472b6;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.cabecalho-secao a:hover {
  text-decoration: underline;
}

.grade {
  display: grid;
  gap: 20px;
}

.grade-4 {
  grid-template-columns: repeat(4, 1fr);
}

.grade-2 {
  grid-template-columns: repeat(2, 1fr);
}

.dividido {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
}

.vazio {
  padding: 28px 20px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-align: center;
}

/* Seu momento */
.momento {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #7b6cf6, #ec4899);
  color: white;
  text-decoration: none;
}

.momento > * {
  position: relative;
}

.momento > .circulo {
  position: absolute;
}

.circulo-momento-1 {
  width: 140px;
  height: 140px;
  top: -30px;
  right: -30px;
}

.circulo-momento-2 {
  width: 60px;
  height: 60px;
  right: 50px;
  bottom: -26px;
}

.momento img {
  width: 72px;
}

.momento div {
  flex: 1;
}

.momento h3 {
  margin: 6px 0 4px;
  font-size: 22px;
}

.momento div p:last-child {
  font-size: 14px;
}

.botao-momento {
  padding: 10px 16px;
  border-radius: 999px;
  background-color: white;
  color: #1f1019;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

@media (max-width: 960px) {
  .grade-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .dividido {
    grid-template-columns: 1fr;
  }

  .destaque-texto {
    padding: 28px;
  }

  .destaque-texto h2 {
    font-size: 30px;
  }
}

@media (max-width: 560px) {
  .saudacao h1 {
    font-size: 24px;
  }

  .grade-4,
  .grade-2 {
    grid-template-columns: 1fr;
  }

  .momento {
    flex-direction: column;
    align-items: flex-start;
  }

  .momento img {
    display: none;
  }
}
</style>
