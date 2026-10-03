<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import EventCard from '@/components/EventCard.vue'
import LugarCard from '@/components/LugarCard.vue'
import { categorias as listaCategorias } from '@/data/categorias'
import { listarEventos, listarLugares } from '@/services/eventos'
import type { Evento, Lugar } from '@/types/evento'

type Extra = 'acessivel' | 'pet' | 'familia'
const campoExtra = { acessivel: 'acessivel', pet: 'petFriendly', familia: 'paraFamilia' } as const
type TipoFiltro = 'eventos' | 'lugares' | 'ambos'
type DataFiltro = '' | 'hoje' | 'amanha' | 'fds' | 'escolher'
type Periodo = 'Manhã' | 'Tarde' | 'Noite'
type PrecoFiltro = '' | 'gratis' | '50' | '100' | 'custom'
type Ordem = 'relevancia' | 'proximos' | 'data' | 'preco'


const categorias = listaCategorias.map((c) => c.nome)
const bairros = ['Centro', 'América', 'Glória', 'Atiradores', 'Saguaçu', 'Bucarein', 'Boa Vista']

const iconesCategoria = Object.fromEntries(listaCategorias.map((c) => [c.nome, c.icone]))

const eventos = ref<Evento[]>([])
const lugares = ref<Lugar[]>([])
const erro = ref(false)

onMounted(async () => {
  if (window.history.state?.focarBusca) document.getElementById('campo-busca')?.focus()

  try {
    ;[eventos.value, lugares.value] = await Promise.all([listarEventos(), listarLugares()])
  } catch {
    erro.value = true
  }
})

const PRECO_MAX = 150 
const DIST_MAX = 20 

const tiposOpcoes: { id: TipoFiltro; label: string }[] = [
  { id: 'eventos', label: 'Eventos' },
  { id: 'lugares', label: 'Lugares' },
  { id: 'ambos', label: 'Ambos' },
]
const datasOpcoes: { id: DataFiltro; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'amanha', label: 'Amanhã' },
  { id: 'fds', label: 'Fim de semana' },
  { id: 'escolher', label: 'Escolher data' },
]
const periodosOpcoes: Periodo[] = ['Manhã', 'Tarde', 'Noite']
const precosOpcoes: { id: PrecoFiltro; label: string }[] = [
  { id: 'gratis', label: 'Grátis' },
  { id: '50', label: 'Até R$ 50' },
  { id: '100', label: 'Até R$ 100' },
]
const extrasOpcoes: { id: Extra; label: string }[] = [
  { id: 'acessivel', label: 'Acessível' },
  { id: 'pet', label: 'Pet friendly' },
  { id: 'familia', label: 'Para família' },
]
const ordensOpcoes: { id: Ordem; label: string }[] = [
  { id: 'relevancia', label: 'Relevância' },
  { id: 'proximos', label: 'Mais próximos' },
  { id: 'data', label: 'Data' },
  { id: 'preco', label: 'Menor preço' },
]

const filtrosVazios = () => ({
  tipo: 'ambos' as TipoFiltro,
  data: '' as DataFiltro,
  dataEscolhida: '',
  periodos: [] as Periodo[],
  preco: '' as PrecoFiltro,
  precoMax: PRECO_MAX,
  distancia: DIST_MAX,
  categorias: [] as string[],
  bairros: [] as string[],
  extras: [] as Extra[],
})
type Filtros = ReturnType<typeof filtrosVazios>

const filtros = reactive(filtrosVazios())
const busca = ref('')
const digitando = ref(false)
const enviado = ref(false)
const aba = ref<'eventos' | 'lugares'>('eventos')
const ordem = ref<Ordem>('relevancia')

function normalizar(t: string) {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function alternar<T>(lista: T[], valor: T) {
  const i = lista.indexOf(valor)
  if (i >= 0) lista.splice(i, 1)
  else lista.push(valor)
}

function dataDoItem(dias: number) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + dias)
  return d
}

function isoLocal(d: Date) {
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

function periodoDoDia(h: number): Periodo {
  if (h < 12) return 'Manhã'
  if (h < 18) return 'Tarde'
  return 'Noite'
}

function formatarPreco(p: number) {
  return p === 0 ? 'Grátis' : `R$ ${p}`
}

const precoSlider = computed({
  get: () =>
    filtros.preco === 'custom'
      ? filtros.precoMax
      : (({ gratis: 0, '50': 50, '100': 100 } as Record<string, number>)[filtros.preco] ?? PRECO_MAX),
  set: (v: number) => {
    filtros.precoMax = v
    filtros.preco = v >= PRECO_MAX ? '' : v === 0 ? 'gratis' : 'custom'
  },
})

function selecionarTipo(t: TipoFiltro) {
  filtros.tipo = t
}

function selecionarData(id: DataFiltro) {
  filtros.data = filtros.data === id ? '' : id
  if (filtros.data !== 'escolher') filtros.dataEscolhida = ''
}

function limparData() {
  filtros.data = ''
  filtros.dataEscolhida = ''
}

function selecionarPreco(id: PrecoFiltro) {
  filtros.preco = filtros.preco === id ? '' : id
  filtros.precoMax = PRECO_MAX
}

function limparPreco() {
  filtros.preco = ''
  filtros.precoMax = PRECO_MAX
}

function limparFiltros() {
  clearTimeout(timerRecente)
  registrarRecente(digitando.value ? '' : busca.value) 
  Object.assign(filtros, filtrosVazios())
}

const rotuloData = computed(() => {
  if (filtros.data === 'escolher') {
    return filtros.dataEscolhida ? filtros.dataEscolhida.split('-').reverse().join('/') : 'Escolher data'
  }
  return ({ hoje: 'Hoje', amanha: 'Amanhã', fds: 'Fim de semana', '': '' } as Record<string, string>)[filtros.data] ?? ''
})

const rotuloPreco = computed(() => {
  if (filtros.preco === 'custom') return `Até R$ ${filtros.precoMax}`
  return ({ gratis: 'Grátis', '50': 'Até R$ 50', '100': 'Até R$ 100', '': '' } as Record<string, string>)[filtros.preco] ?? ''
})

interface ChipAtivo {
  chave: 'tipo' | 'data' | 'periodo' | 'preco' | 'distancia' | 'categoria' | 'bairro' | 'extra'
  valor?: string
  rotulo: string
}

const chipsAtivos = computed<ChipAtivo[]>(() => {
  const f = filtros
  const out: ChipAtivo[] = []
  if (f.tipo !== 'ambos') out.push({ chave: 'tipo', rotulo: f.tipo === 'eventos' ? 'Só eventos' : 'Só lugares' })
  if (f.data) out.push({ chave: 'data', rotulo: rotuloData.value })
  f.periodos.forEach((p) => out.push({ chave: 'periodo', valor: p, rotulo: p }))
  if (f.preco) out.push({ chave: 'preco', rotulo: rotuloPreco.value })
  if (f.distancia < DIST_MAX) out.push({ chave: 'distancia', rotulo: `Até ${f.distancia} km` })
  f.categorias.forEach((c) => out.push({ chave: 'categoria', valor: c, rotulo: c }))
  f.bairros.forEach((b) => out.push({ chave: 'bairro', valor: b, rotulo: b }))
  f.extras.forEach((e) =>
    out.push({ chave: 'extra', valor: e, rotulo: extrasOpcoes.find((x) => x.id === e)?.label ?? e })
  )
  return out
})

function removerChip(c: ChipAtivo) {
  const f = filtros
  switch (c.chave) {
    case 'tipo': f.tipo = 'ambos'; break
    case 'data': limparData(); break
    case 'periodo': alternar(f.periodos, c.valor as Periodo); break
    case 'preco': limparPreco(); break
    case 'distancia': f.distancia = DIST_MAX; break
    case 'categoria': alternar(f.categorias, c.valor as string); break
    case 'bairro': alternar(f.bairros, c.valor as string); break
    case 'extra': alternar(f.extras, c.valor as Extra); break
  }
}

const termo = computed(() => normalizar(busca.value))

function contemTermo(textos: string[], t: string) {
  return !t || normalizar(textos.join(' ')).includes(t)
}

function passaBairroEExtras(item: Evento | Lugar, f: Filtros) {
  if (f.bairros.length && !f.bairros.includes(item.bairro)) return false
  return f.extras.every((e) => item[campoExtra[e]])
}

function passaDataHora(evento: Evento, f: Filtros) {
  const inicio = new Date(evento.inicio)
  if (f.data === 'hoje' && isoLocal(inicio) !== isoLocal(dataDoItem(0))) return false
  if (f.data === 'amanha' && isoLocal(inicio) !== isoLocal(dataDoItem(1))) return false
  if (f.data === 'fds' && ![0, 6].includes(inicio.getDay())) return false
  if (f.data === 'escolher' && f.dataEscolhida && isoLocal(inicio) !== f.dataEscolhida) return false
  if (f.periodos.length && !f.periodos.includes(periodoDoDia(inicio.getHours()))) return false
  return true
}

function passaEvento(evento: Evento, f: Filtros, t: string) {
  if (!contemTermo([evento.titulo, evento.local, evento.bairro, ...evento.categorias], t)) return false
  if (f.preco === 'gratis' && evento.preco !== 0) return false
  if (f.preco === '50' && evento.preco > 50) return false
  if (f.preco === '100' && evento.preco > 100) return false
  if (f.preco === 'custom' && evento.preco > f.precoMax) return false
  if (f.distancia < DIST_MAX && evento.distanciaKm > f.distancia) return false
  if (f.categorias.length && !evento.categorias.some((c) => f.categorias.includes(c))) return false
  return passaBairroEExtras(evento, f) && passaDataHora(evento, f)
}

function passaLugar(lugar: Lugar, f: Filtros, t: string) {
  if (!contemTermo([lugar.nome, lugar.tipo, lugar.categoria, lugar.bairro], t)) return false
  if (f.categorias.length && !f.categorias.includes(lugar.categoria)) return false
  return passaBairroEExtras(lugar, f)
}

function ordenar(lista: Evento[]) {
  const l = [...lista]
  if (ordem.value === 'proximos') l.sort((a, b) => a.distanciaKm - b.distanciaKm)
  else if (ordem.value === 'data') l.sort((a, b) => a.inicio.localeCompare(b.inicio))
  else if (ordem.value === 'preco') l.sort((a, b) => a.preco - b.preco)
  return l
}

function buscar(f: Filtros) {
  const t = termo.value
  return {
    eventos: f.tipo === 'lugares' ? [] : ordenar(eventos.value.filter((e) => passaEvento(e, f, t))),
    lugares: f.tipo === 'eventos' ? [] : lugares.value.filter((l) => passaLugar(l, f, t)),
  }
}

const resultados = computed(() => buscar(filtros))
const semFiltros = computed(() => buscar(filtrosVazios())) 

const total = computed(() => resultados.value.eventos.length + resultados.value.lugares.length)
const totalSemFiltros = computed(() =>
  aba.value === 'eventos' ? semFiltros.value.eventos.length : semFiltros.value.lugares.length
)

watch(resultados, ({ eventos, lugares }) => {
  if (aba.value === 'eventos' && !eventos.length && lugares.length) aba.value = 'lugares'
  else if (aba.value === 'lugares' && !lugares.length && eventos.length) aba.value = 'eventos'
})

const temBusca = computed(() => enviado.value || busca.value.trim() !== '' || chipsAtivos.value.length > 0)
const mostrarResultados = computed(() => temBusca.value && !digitando.value)

const sugestoes = computed(() => {
  const q = termo.value
  if (q.length < 2) return null
  const cats = categorias.filter((c) => normalizar(c).includes(q)).slice(0, 2)
  const evs = eventos.value.filter((e) => normalizar(`${e.titulo} ${e.local}`).includes(q)).slice(0, 4)
  const pls = lugares.value.filter((l) => normalizar(l.nome).includes(q)).slice(0, 2)
  return { cats, evs, pls, vazio: !cats.length && !evs.length && !pls.length }
})

function sairDaBusca() {
  digitando.value = false
  ;(document.activeElement as HTMLElement | null)?.blur()
}

function aoSairDoCampo() {
  setTimeout(() => {
    const ativo = document.activeElement as HTMLElement | null
    if (ativo?.id !== 'campo-busca') {
      digitando.value = false
      if (busca.value.trim()) {
        registrarRecente(busca.value)
        enviado.value = true
      }
    }
  }, 200)
}

function escolherSugestao(texto: string) {
  busca.value = texto
  enviarBusca()
}

const CHAVE_RECENTES = 'buscas-recentes'
const MAX_RECENTES = 5

interface Recente {
  chave: string
  rotulo: string
  busca: string
  filtros: Filtros
}

function carregarRecentes(): Recente[] {
  try {
    const salvo = localStorage.getItem(CHAVE_RECENTES)
    const lista = salvo ? JSON.parse(salvo) : []
    if (!Array.isArray(lista)) return []
    return lista
      .map((r: unknown): Recente | null => {
        // formato antigo: só texto
        if (typeof r === 'string') {
          return { chave: normalizar(r) + '|' + JSON.stringify(filtrosVazios()), rotulo: r, busca: r, filtros: filtrosVazios() }
        }
        const o = r as Partial<Recente>
        if (o && typeof o.chave === 'string' && typeof o.rotulo === 'string') {
          return { chave: o.chave, rotulo: o.rotulo, busca: o.busca ?? '', filtros: { ...filtrosVazios(), ...(o.filtros ?? {}) } }
        }
        return null
      })
      .filter((r): r is Recente => r !== null)
      .slice(0, MAX_RECENTES)
  } catch {
    return []
  }
}

const recentes = ref<Recente[]>(carregarRecentes())

function salvarRecentes() {
  try {
    localStorage.setItem(CHAVE_RECENTES, JSON.stringify(recentes.value))
  } catch {
  }
}

function registrarRecente(textoBusca: string) {
  const t = textoBusca.trim()
  const chips = chipsAtivos.value
  if (!t && !chips.length) return
  const rotulo = [t, ...chips.map((c) => c.rotulo)].filter(Boolean).join(' · ')
  const copia: Filtros = JSON.parse(JSON.stringify(filtros))
  const chave = normalizar(t) + '|' + JSON.stringify(copia)
  const sem = recentes.value.filter((r) => r.chave !== chave)
  recentes.value = [{ chave, rotulo, busca: t, filtros: copia }, ...sem].slice(0, MAX_RECENTES)
  salvarRecentes()
}

let timerRecente: ReturnType<typeof setTimeout> | undefined
watch(filtros, () => {
  clearTimeout(timerRecente)
  timerRecente = setTimeout(() => registrarRecente(digitando.value ? '' : busca.value), 1500)
}, { deep: true })

function enviarBusca() {
  registrarRecente(busca.value)
  enviado.value = true
  sairDaBusca()
}

function usarRecente(r: Recente) {
  clearTimeout(timerRecente)
  busca.value = r.busca
  Object.assign(filtros, filtrosVazios(), JSON.parse(JSON.stringify(r.filtros)))
  enviado.value = true
  sairDaBusca()
  registrarRecente(r.busca) 
}

function limparRecentes() {
  recentes.value = []
  salvarRecentes()
}

function limparCampo() {
  busca.value = ''
  digitando.value = true
  document.getElementById('campo-busca')?.focus()
}

const rotuloCategoria = computed(() => {
  const mapa: Record<string, string> = {}
  for (const c of categorias) {
    const n = eventos.value.filter((e) => e.categorias.includes(c)).length
    const m = lugares.value.filter((l) => l.categoria === c).length
    mapa[c] = m > n ? `${m} ${m === 1 ? 'lugar' : 'lugares'}` : `${n} ${n === 1 ? 'evento' : 'eventos'}`
  }
  return mapa
})

function aplicarCategoria(c: string) {
  filtros.categorias = [c]
  busca.value = ''
  sairDaBusca()
  aba.value = ['Bares', 'Gastronomia'].includes(c) && resultados.value.lugares.length ? 'lugares' : 'eventos'
}

function voltarInicio() {
  clearTimeout(timerRecente)
  registrarRecente(busca.value) 
  busca.value = ''
  enviado.value = false
  digitando.value = false
  ordem.value = 'relevancia'
  Object.assign(filtros, filtrosVazios())
}

const route = useRoute()

function aplicarQuery() {
  const { q, data, preco, categoria, tipo, ordem: ordemPedida } = route.query
  const temFiltro = [data, preco, categoria, tipo, ordemPedida].some((v) => typeof v === 'string')

  if (temFiltro) {
    clearTimeout(timerRecente)
    Object.assign(filtros, filtrosVazios())
    if (data === 'hoje' || data === 'amanha' || data === 'fds') filtros.data = data
    if (preco === 'gratis') filtros.preco = 'gratis'
    if (typeof categoria === 'string' && categorias.includes(categoria)) filtros.categorias = [categoria]
    if (tipo === 'eventos' || tipo === 'lugares') filtros.tipo = tipo
    // se não houver eventos no resultado, o watch de resultados troca para a aba de lugares
    aba.value = tipo === 'lugares' ? 'lugares' : 'eventos'
    ordem.value = ordensOpcoes.find((o) => o.id === ordemPedida)?.id ?? 'relevancia'
  }

  busca.value = typeof q === 'string' ? q : ''
  enviado.value = temFiltro || busca.value.trim() !== ''
  digitando.value = false
}

watch(() => route.query, aplicarQuery, { immediate: true })
</script>
<template>
  <main>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.3.1/css/fontawesome.css"
      integrity="sha512-cOd3Jjo4vXG7cyt5/gEQgxwL6c7THvNQxSZphogpsFKsnbgeqEWa7Xsyf7zvDMpdmDAhiUUJGQPc5R3pocvnBQ=="
      crossorigin="anonymous" referrerpolicy="no-referrer">
  </main>

  <form class="busca" @submit.prevent="enviarBusca">
    <i class="fa-solid fa-magnifying-glass"></i>
    <input
      id="campo-busca"
      v-model="busca"
      type="search"
      autocomplete="off"
      placeholder="Buscar evento, lugar ou artista"
      @focus="digitando = true"
      @input="digitando = true"
      @blur="aoSairDoCampo"
    >
    <button v-if="busca" type="button" class="busca-limpar" aria-label="Limpar busca" @mousedown.prevent @click="limparCampo">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </form>


  <div class="container">
    <div class="filtro-wrapper">
      <div class="filtro-container">
        <div class="menu-filtragem">
          <h3>
            <i class="fa-solid fa-sliders"></i> Filtros
            <span v-if="chipsAtivos.length" class="contador">{{ chipsAtivos.length }}</span>
          </h3>
          <p @click="limparFiltros">Limpar</p>
        </div>
        <div class="linha"></div>

        <div class="filtro-scroll">
          <div class="filtro-grupo">
            <p class="grupo-titulo">Tipo</p>
            <div class="filtragem-tipo">
              <button
                v-for="t in tiposOpcoes" :key="t.id" type="button"
                class="opcao-tipo" :class="{ ativo: filtros.tipo === t.id }"
                @click="selecionarTipo(t.id)"
              >{{ t.label }}</button>
            </div>
          </div>

          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Data</p>
              <span class="grupo-limpar" @click="limparData">{{ rotuloData || 'Qualquer dia' }}</span>
            </div>
            <div class="chips">
              <button
                v-for="d in datasOpcoes" :key="d.id" type="button"
                class="chip" :class="{ ativo: filtros.data === d.id }"
                @click="selecionarData(d.id)"
              >{{ d.label }}</button>
            </div>
            <input v-if="filtros.data === 'escolher'" v-model="filtros.dataEscolhida" type="date" class="input-data" />
          </div>

          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Horário</p>
              <span class="grupo-limpar" @click="filtros.periodos = []">
                {{ filtros.periodos.join(', ') || 'Qualquer horário' }}
              </span>
            </div>
            <div class="chips">
              <button
                v-for="p in periodosOpcoes" :key="p" type="button"
                class="chip" :class="{ ativo: filtros.periodos.includes(p) }"
                @click="alternar(filtros.periodos, p)"
              >{{ p }}</button>
            </div>
          </div>

          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Preço</p>
              <span class="grupo-limpar" @click="limparPreco">{{ rotuloPreco || 'Qualquer preço' }}</span>
            </div>
            <div class="chips">
              <button
                v-for="p in precosOpcoes" :key="p.id" type="button"
                class="chip" :class="{ ativo: filtros.preco === p.id }"
                @click="selecionarPreco(p.id)"
              >{{ p.label }}</button>
            </div>
            <input v-model.number="precoSlider" type="range" min="0" max="150" step="5" class="slider" />
            <div class="slider-legenda"><span>R$ 0</span><span>R$ 75</span><span>R$ 150+</span></div>
          </div>

          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Distância</p>
              <span class="grupo-limpar" @click="filtros.distancia = DIST_MAX">
                {{ filtros.distancia >= DIST_MAX ? 'Qualquer distância' : `até ${filtros.distancia} km` }}
              </span>
            </div>
            <input v-model.number="filtros.distancia" type="range" min="1" max="20" class="slider" />
            <div class="slider-legenda"><span>1 km</span><span>10 km</span><span>20 km+</span></div>
          </div>

          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Categoria</p>
              <span class="grupo-limpar" @click="filtros.categorias = []">
                {{ filtros.categorias.length ? `${filtros.categorias.length} selecionada${filtros.categorias.length > 1 ? 's' : ''}` : 'Todas' }}
              </span>
            </div>
            <div class="chips">
              <button
                class="chip" v-for="c in categorias" :key="c" type="button"
                :class="{ ativo: filtros.categorias.includes(c) }"
                @click="alternar(filtros.categorias, c)"
              >{{ c }}</button>
            </div>
          </div>

          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Bairro</p>
              <span class="grupo-limpar" @click="filtros.bairros = []">
                {{ filtros.bairros.length ? `${filtros.bairros.length} selecionado${filtros.bairros.length > 1 ? 's' : ''}` : 'Todos' }}
              </span>
            </div>
            <div class="chips">
              <button
                class="chip" v-for="b in bairros" :key="b" type="button"
                :class="{ ativo: filtros.bairros.includes(b) }"
                @click="alternar(filtros.bairros, b)"
              >{{ b }}</button>
            </div>
          </div>

          <div class="filtro-grupo">
            <p class="grupo-titulo">Mais opções</p>
            <div class="chips">
              <button
                v-for="e in extrasOpcoes" :key="e.id" type="button"
                class="chip" :class="{ ativo: filtros.extras.includes(e.id) }"
                @click="alternar(filtros.extras, e.id)"
              >{{ e.label }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="categorias-container">
      <p v-if="erro" class="erro-carga" role="alert">
        Não foi possível carregar os eventos e lugares. Verifique se o servidor está no ar e
        recarregue a página.
      </p>

      <template v-if="!(digitando && sugestoes)">
        <div class="menu-recente">
          <h2 class="busca-recente">Busca Recente</h2>
          <p class="limpar-recentes" @click="limparRecentes">Limpar</p>
        </div>
        <div class="busca-recente-container">
          <button
            v-for="r in recentes" :key="r.chave" type="button"
            class="filtro-recente" @click="usarRecente(r)"
          >{{ r.rotulo }}</button>
          <span v-if="!recentes.length" class="sem-recentes">Nenhuma busca recente</span>
        </div>
      </template>

      <div v-if="digitando && sugestoes" class="sugestoes">
        <p class="sugestoes-titulo">Sugestões</p>

        <button
          v-for="c in sugestoes.cats" :key="'cat-' + c" type="button" class="sugestao"
          @mousedown.prevent @click="aplicarCategoria(c)"
        >
          <i :class="iconesCategoria[c]"></i><span>{{ c }}</span><small>Categoria</small>
        </button>

        <button
          v-for="i in sugestoes.evs" :key="i.id" type="button" class="sugestao"
          @mousedown.prevent @click="escolherSugestao(i.titulo)"
        >
          <i class="fa-solid fa-calendar"></i><span>{{ i.titulo }}</span>
          <small>Evento · {{ i.data }} · {{ formatarPreco(i.preco) }}</small>
        </button>

        <button
          v-for="i in sugestoes.pls" :key="i.id" type="button" class="sugestao"
          @mousedown.prevent @click="escolherSugestao(i.nome)"
        >
          <i class="fa-solid fa-location-dot"></i><span>{{ i.nome }}</span>
          <small>Lugar · {{ i.tipo }}</small>
        </button>

        <p v-if="sugestoes.vazio" class="sem-recentes">Nada com “{{ busca }}” ainda.</p>

        <button type="button" class="btn-link" @mousedown.prevent @click="enviarBusca">
          Ver todos os resultados para “{{ busca }}”
        </button>
      </div>

      <template v-else-if="mostrarResultados">
        <div class="resultados-topo">
          <button type="button" class="btn-voltar" @click="voltarInicio">
            <i class="fa-solid fa-arrow-left"></i> Voltar
          </button>
          <span class="resultados-total">{{ total }} {{ total === 1 ? 'resultado' : 'resultados' }}</span>
          <select v-model="ordem" class="ordenar" aria-label="Ordenar por">
            <option v-for="o in ordensOpcoes" :key="o.id" :value="o.id">{{ o.label }}</option>
          </select>
        </div>

        <div v-if="chipsAtivos.length" class="chips chips-ativos">
          <button
            v-for="c in chipsAtivos" :key="c.chave + '-' + (c.valor ?? '')" type="button"
            class="chip chip-removivel" :aria-label="'Remover filtro ' + c.rotulo" @click="removerChip(c)"
          >{{ c.rotulo }} <i class="fa-solid fa-xmark"></i></button>
          <button type="button" class="btn-link" @click="limparFiltros">Limpar tudo</button>
        </div>

        <div class="filtragem-tipo abas">
          <button type="button" class="opcao-tipo" :class="{ ativo: aba === 'eventos' }" @click="aba = 'eventos'">
            Eventos <span class="n">{{ resultados.eventos.length }}</span>
          </button>
          <button type="button" class="opcao-tipo" :class="{ ativo: aba === 'lugares' }" @click="aba = 'lugares'">
            Lugares <span class="n">{{ resultados.lugares.length }}</span>
          </button>
        </div>

        <div v-if="aba === 'eventos' && resultados.eventos.length" class="resultados-grid">
          <EventCard v-for="evento in resultados.eventos" :key="evento.id" :evento="evento" />
        </div>

        <div v-else-if="aba === 'lugares' && resultados.lugares.length" class="resultados-grid">
          <LugarCard v-for="lugar in resultados.lugares" :key="lugar.id" :lugar="lugar" />
        </div>

        <div v-else class="vazio">
          <i class="fa-solid fa-magnifying-glass"></i>
          <h3>Nenhum {{ aba === 'eventos' ? 'evento' : 'lugar' }} encontrado</h3>
          <p v-if="chipsAtivos.length">
            Tente remover algum filtro. Sem filtros, encontramos {{ totalSemFiltros }}
            {{ aba === 'eventos' ? 'eventos' : 'lugares' }}{{ busca.trim() ? ` para “${busca.trim()}”` : '' }}.
          </p>
          <p v-else>Tente outra palavra, como “show” ou “feira”.</p>
          <button v-if="chipsAtivos.length" type="button" class="btn-voltar" @click="limparFiltros">
            Limpar todos os filtros
          </button>
        </div>
      </template>

      <template v-else>
        <h1 class="categoria">Categorias</h1>
        <div class="cards-container">
          <div v-for="c in categorias" :key="c" class="card-categoria" @click="aplicarCategoria(c)">
            <div class="icone-card"><i :class="iconesCategoria[c]"></i></div>
            <h1 class="titulo-card">{{ c }}</h1>
            <p class="quant-eventos-card">{{ rotuloCategoria[c] }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');



:global(body) {
  background-color: #2e0a1e;
  font-family: 'DM Sans', sans-serif;
}



.busca {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
  transition: border-color 0.2s;
   width: 95%;
  height: 50px;
  margin: 32px auto 0;
}
.busca i{
  margin-left: 30px;
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



.lupa-pesquisa {
  margin-left: 20px;
}


.filtro-wrapper {
  position: relative;
}

.filtro-container {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background-color: #412233;
  border-radius: 30px;
  overflow: hidden;

}

.menu-filtragem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0px 12px;
}

.menu-filtragem h3 {
  color: #fff;
  margin: 0;
  font-size: 1rem;
}

.menu-filtragem p {
  color: #DD82AD;
  font-size: 0.9rem;
  font-weight: bold;
  margin: 10px 20px 10px 10px;
  cursor: pointer;
}

.linha {
  height: 1px;
  background-color: #70475e;
  flex-shrink: 0;
}

.filtro-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* scrollbar*/
.filtro-scroll::-webkit-scrollbar {
  width: 6px;
}

.filtro-scroll::-webkit-scrollbar-thumb {
  background: #70475e;
  border-radius: 10px;
}

.filtro-scroll {
  scrollbar-width: thin;
  scrollbar-color: #70475e transparent;
}

.grupo-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grupo-titulo {
  color: #fff;
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0 0 10px;
}

.grupo-limpar {
  color: #ff6fae;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 10px;
  cursor: pointer;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  background: transparent;
  color: #fff;
  border: 1px solid #70475e;
  border-radius: 50px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

.chip:hover {
  background-color: #70475e;
}

.filtragem-tipo {
  border: 1px solid #70475e;
  padding: 4px;
  border-radius: 50px;
  width: 300px;
  display: flex;
  gap: 40px;
  color: #ffff;
  justify-content: center;
  margin: 0 auto;
  font-weight: bold;

}


.opcao-tipo {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-family: inherit;
  font-weight: bold;
  font-size: 0.8rem;
  padding: 8px 0;
  border-radius: 50px;
  cursor: pointer;
}

.opcao-tipo.ativo {
  background: #fff;
  color: #2e0a1e;
}

.slider {
  width: 100%;
  accent-color: #ff6fae;
  margin-top: 14px;
}

.slider-legenda {
  display: flex;
  justify-content: space-between;
  color: #adacad;
  font-size: 0.65rem;
}



/*filtragem*/
.filtro-container {
  background-color: #412233;
  border-radius: 30px;
  height: 612px;

}

.menu-filtragem {
  display: flex;
  margin-left: 30px;
  width: 400px;
}

.menu-filtragem p {
  color: #DD82AD;
  font-size: 0.9rem;
  font-weight: bold;
  margin-left: 230px;
  margin-top: 20px;

}

.menu-filtragem h3 {
  color: #ffff;
}

.linha {
  width: 90%;
  background-color: #70475e;
  height: 1px;
  margin: 0 auto;

}

.tipo {
  color: #ffff;
  font-size: 1rem;
  font-weight: bold;
  margin-left: 40px;
}


/*Cards*/

.cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 0px 0px 50px 0px;
}

.card-categoria {
  position: relative;
  overflow: hidden;
  height: 120px;
  padding: 14px 16px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  cursor: pointer;
  background: var(--gradiente);
  transition: transform 0.2s ease, filter 0.2s ease;
}

.card-categoria:hover {
  transform: translateY(-3px);
  filter: brightness(1.08);
}

.card-categoria::after {
  content: '';
  position: absolute;
  top: -30px;
  right: -30px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  pointer-events: none;
}

.icone-card {
  position: relative;
  z-index: 1;
  font-size: 1.1rem;
}

.info-card {
  position: relative;
  z-index: 1;
}

.titulo-card {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}

.quant-eventos-card {
  margin: 2px 0 0;
  font-size: 0.7rem;
  font-weight: 600;
  opacity: 0.9;
}

.card-categoria:nth-child(1),
.card-categoria:nth-child(5),
.card-categoria:nth-child(9) {
  --gradiente: linear-gradient(135deg, #f04fb0 0%, #7b4aa8 100%);
}

.card-categoria:nth-child(2),
.card-categoria:nth-child(6),
.card-categoria:nth-child(10) {
  --gradiente: linear-gradient(135deg, #ff9a56 0%, #c2306f 100%);
}

.card-categoria:nth-child(3),
.card-categoria:nth-child(7),
.card-categoria:nth-child(11) {
  --gradiente: linear-gradient(135deg, #e8479f 0%, #7a1f55 100%);
}

.card-categoria:nth-child(4),
.card-categoria:nth-child(8),
.card-categoria:nth-child(12) {
  --gradiente: linear-gradient(135deg, #a259f0 0%, #4a3a87 100%);
}


/*busca recente css*/
.busca-recente-container {
  display: flex;
  gap: 5px;
  color: #ffff;
  font-size: 1rem;
}

.filtro-recente {
  background: transparent;
  color: #fff;
  border: 1px solid #70475e;
  border-radius: 50px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}


.menu-recente {
  display: flex;
}

.menu-recente p {
  color: #777476;
  font-weight: bold;
  margin-left: 730px;
  margin-top: 20px;
  cursor: pointer;
    transition: .5s ease;

}

.menu-recente p:hover{
  color: #c2306f;
  transition: .5s ease;
}

.menu-recente h2 {
  color: #fff;
  font-size: 1.4rem;
}

/*conteudo*/

.categoria {
  color: #ffff;
  font-size: 1.2rem;
}

.container {
  display: grid;
  grid-template-columns: 30% 1fr;
  width: 95%;
  gap: 30px;
  margin: 28px auto 0;
}

.chip.ativo {
  background-color: #f472b6;
  border-color: #f472b6;
  color: #2e0a1e;
}

.contador {
  display: inline-block;
  min-width: 20px;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #ff6fae;
  color: #2e0a1e;
  font-size: 0.7rem;
  text-align: center;
}

.input-data {
  margin-top: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #70475e;
  border-radius: 12px;
  background: transparent;
  color: #fff;
  font-family: inherit;
  color-scheme: dark;
}

/* botão de limpar dentro da busca */
.busca-limpar {
  background: none;
  border: none;
  padding: 0;
  margin-right: 24px;
  color: inherit;
  cursor: pointer;
}

.busca .busca-limpar i {
  margin-left: 0;
}

/* buscas recentes */
.filtro-recente:hover {
  background-color: #70475e;
}

.sem-recentes {
  color: #adacad;
  font-size: 0.8rem;
}

.sugestoes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 20px;
}

.sugestoes-titulo {
  margin: 0 0 4px;
  color: #adacad;
  font-size: 0.8rem;
  font-weight: bold;
}

.sugestao {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #70475e;
  border-radius: 16px;
  background: #412233;
  color: #fff;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.sugestao:hover {
  background: #70475e;
}

.sugestao span {
  flex: 1;
  font-weight: 600;
}

.sugestao small {
  color: #adacad;
  font-size: 0.7rem;
}

.btn-link {
  align-self: flex-start;
  background: none;
  border: none;
  padding: 4px 0;
  color: #ff6fae;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
}

.resultados-topo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 12px;
}

.resultados-total {
  margin-right: auto;
  color: #fff;
  font-weight: 700;
}

.btn-voltar {
  background: transparent;
  border: 1px solid #70475e;
  border-radius: 50px;
  color: #ff6fae;
  padding: 6px 14px;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
}

.btn-voltar:hover {
  background-color: #70475e;
}

.ordenar {
  padding: 6px 12px;
  border: 1px solid #70475e;
  border-radius: 50px;
  background: transparent;
  color: #fff;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color-scheme: dark;
  cursor: pointer;
}

.ordenar option {
  background-color: #412233;
  color: #fff;

}

.ordenar option:checked {
  background-color: #70475e;
  color: #fff;
}

.chips-ativos {
  align-items: center;
  margin-bottom: 14px;
}

.chip-removivel {
  background-color: #70475e;
}

.abas {
  margin: 14px auto 18px;
}

.abas .n {
  margin-left: 4px;
  opacity: 0.7;
}

.resultados-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 12px;
  margin-bottom: 50px;
}

.erro-carga {
  margin: 20px 0 0;
  padding: 14px 18px;
  border: 1px dashed #70475e;
  border-radius: 16px;
  color: #fff;
  font-size: 0.85rem;
}

.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 50px 0;
  color: #adacad;
  text-align: center;
}

.vazio i {
  font-size: 2rem;
}

.vazio h3 {
  margin: 0;
  color: #fff;
}

.vazio p {
  margin: 0;
}
</style>