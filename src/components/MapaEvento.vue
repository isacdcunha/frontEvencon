<script lang="ts">
export interface ResumoRota {
  distanciaKm: number
  minutos: number
}

// Mapa do OpenStreetMap e rotas do servidor público do OSRM: nenhum dos dois precisa de chave.
const URL_MAPA = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const CREDITOS_MAPA = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const URL_ROTAS = 'https://router.project-osrm.org/route/v1/driving'

class ErroRota extends Error {}
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  latitude: number
  longitude: number
  rotulo: string
  icone: string
}>()

const emit = defineEmits<{
  rota: [resumo: ResumoRota | undefined]
}>()

const elementoMapa = ref<HTMLDivElement>()
const tracandoRota = ref(false)
const rotaVisivel = ref(false)
const avisoRota = ref('')

let mapa: L.Map | undefined
let marcador: L.Marker | undefined
let marcadorOrigem: L.Marker | undefined
let linhaRota: L.Polyline | undefined

function criarIconeEvento() {
  const elemento = document.createElement('div')
  elemento.className = 'marcador-evento'
  const icone = document.createElement('i')
  icone.className = props.icone
  elemento.append(icone, ` ${props.rotulo}`)
  return L.divIcon({ html: elemento, className: 'ancora-marcador', iconSize: [0, 0] })
}

function criarIconeOrigem() {
  const elemento = document.createElement('div')
  elemento.className = 'marcador-origem'
  return L.divIcon({ html: elemento, className: 'ancora-marcador', iconSize: [0, 0] })
}

function iniciarMapa() {
  if (!elementoMapa.value) return

  const posicao: L.LatLngTuple = [props.latitude, props.longitude]

  mapa = L.map(elementoMapa.value, { center: posicao, zoom: 15 })
  L.tileLayer(URL_MAPA, { attribution: CREDITOS_MAPA, maxZoom: 19 }).addTo(mapa)
  marcador = L.marker(posicao, { icon: criarIconeEvento(), title: props.rotulo }).addTo(mapa)
}

function buscarLocalizacao() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new ErroRota('Seu navegador não permite obter a localização.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (falha) =>
        reject(
          new ErroRota(
            falha.code === falha.PERMISSION_DENIED
              ? 'Permita o acesso à sua localização para ver a rota.'
              : 'Não foi possível obter sua localização.',
          ),
        ),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  })
}

async function buscarRota(origem: L.LatLngTuple, destino: L.LatLngTuple) {
  // O OSRM recebe as coordenadas como longitude,latitude
  const pontos = [origem, destino].map(([lat, lng]) => `${lng},${lat}`).join(';')
  const resposta = await fetch(`${URL_ROTAS}/${pontos}?overview=full&geometries=geojson`)
  if (!resposta.ok) throw new ErroRota('Não foi possível traçar a rota.')

  const dados: {
    routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[]
  } = await resposta.json()

  const rota = dados.routes?.[0]
  if (!rota) throw new ErroRota('Não encontramos uma rota de carro até o evento.')
  return rota
}

function limparRota() {
  linhaRota?.remove()
  linhaRota = undefined
  marcadorOrigem?.remove()
  marcadorOrigem = undefined
  rotaVisivel.value = false
  avisoRota.value = ''
  emit('rota', undefined)
}

async function tracarRota() {
  if (!mapa || tracandoRota.value) return

  tracandoRota.value = true
  avisoRota.value = ''

  try {
    const { coords } = await buscarLocalizacao()
    const origem: L.LatLngTuple = [coords.latitude, coords.longitude]
    const rota = await buscarRota(origem, [props.latitude, props.longitude])

    limparRota()

    const caminho = rota.geometry.coordinates.map(([lng, lat]): L.LatLngTuple => [lat, lng])
    linhaRota = L.polyline(caminho, { color: '#f472b6', weight: 5, opacity: 0.9 }).addTo(mapa)
    marcadorOrigem = L.marker(origem, { icon: criarIconeOrigem(), title: 'Você está aqui' }).addTo(
      mapa,
    )
    // a margem lateral deixa espaço para o rótulo do evento não ser cortado
    mapa.fitBounds(linhaRota.getBounds(), { padding: [100, 40] })

    rotaVisivel.value = true
    emit('rota', {
      distanciaKm: rota.distance / 1000,
      minutos: Math.round(rota.duration / 60),
    })
  } catch (falha) {
    avisoRota.value = falha instanceof ErroRota ? falha.message : 'Não foi possível traçar a rota.'
  } finally {
    tracandoRota.value = false
  }
}

watch(
  () => [props.latitude, props.longitude, props.rotulo, props.icone],
  () => {
    if (!mapa || !marcador) return
    const posicao: L.LatLngTuple = [props.latitude, props.longitude]
    limparRota()
    mapa.setView(posicao, 15)
    marcador.setLatLng(posicao)
    marcador.setIcon(criarIconeEvento())
  },
)

onMounted(iniciarMapa)
onBeforeUnmount(() => mapa?.remove())
</script>

<template>
  <div class="mapa">
    <div ref="elementoMapa" class="area-mapa"></div>

    <p v-if="avisoRota" class="aviso-rota" role="alert">{{ avisoRota }}</p>

    <button
      v-if="!rotaVisivel"
      type="button"
      class="botao-rota"
      :disabled="tracandoRota"
      @click="tracarRota"
    >
      <i class="fa-solid fa-route"></i>
      {{ tracandoRota ? 'Traçando rota...' : 'Ver rota' }}
    </button>
  </div>
</template>

<style scoped>
.mapa {
  position: relative;
  /* isola os z-index internos do Leaflet para o mapa não passar por cima do resto da página */
  isolation: isolate;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #2a1a2a;
}

.area-mapa {
  width: 100%;
  height: 100%;
  background-color: #2a1a2a;
  font-family: 'DM Sans', sans-serif;
}

.botao-rota {
  position: absolute;
  z-index: 1000;
  left: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background-color: #1f1019;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  transition: background-color 0.2s;
}

.botao-rota:hover:not(:disabled) {
  background-color: #ec4899;
}

.botao-rota:disabled {
  opacity: 0.7;
  cursor: default;
}

.aviso-rota {
  position: absolute;
  z-index: 1000;
  top: 10px;
  left: 54px;
  right: 10px;
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: rgba(31, 16, 25, 0.92);
  color: white;
  font-size: 12px;
  text-align: center;
}

/* O OpenStreetMap só tem tema claro: inverte as cores do mapa para combinar com a página */
:deep(.leaflet-tile-pane) {
  filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9);
}

:deep(.marcador-evento) {
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background-color: #ec4899;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

:deep(.marcador-origem) {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 3px solid white;
  border-radius: 50%;
  background-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
  transform: translate(-50%, -50%);
}
</style>
