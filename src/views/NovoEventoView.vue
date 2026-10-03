<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import EventCard from '@/components/EventCard.vue'
import { bairros } from '@/data/bairros'
import { categorias } from '@/data/categorias'
import { criarEvento } from '@/services/eventos'
import { buscarCoordenadas, distanciaDoCentro } from '@/services/geocodificacao'
import { useAuthStore } from '@/stores/auth'
import type { Evento, InfoEvento, NovoEvento } from '@/types/evento'

const router = useRouter()
const auth = useAuthStore()

const classificacoes = ['L', '10', '12', '14', '16', '18']
const rotulosPreco = ['a partir de', '1º lote', 'entrada', 'inscrição']
const selos = [
  { valor: '', rotulo: 'Sem selo' },
  { valor: 'Em alta', rotulo: 'Em alta' },
  { valor: 'Novo', rotulo: 'Novo' },
]

const form = reactive({
  imagem: '',
  titulo: '',
  categoria: 'Música',
  tipo: '',
  sobre: '',
  tags: '',
  data: '',
  hora: '',
  detalheHorario: '',
  local: '',
  endereco: '',
  bairro: 'Centro',
  gratis: false,
  preco: '',
  rotuloPreco: 'a partir de',
  linkCompra: '',
  organizador: '',
  classificacao: 'L',
  destaque: '',
  acessivel: false,
  petFriendly: false,
  paraFamilia: false,
})

type Campo = 'titulo' | 'data' | 'hora' | 'local' | 'endereco' | 'preco' | 'organizador' | 'imagem'
const erros = reactive<Record<Campo | 'geral', string>>({
  titulo: '',
  data: '',
  hora: '',
  local: '',
  endereco: '',
  preco: '',
  organizador: '',
  imagem: '',
  geral: '',
})
const publicando = ref(false)

const hoje = new Date().toLocaleDateString('en-CA') // AAAA-MM-DD no fuso local

const icone = computed(
  () => categorias.find((c) => c.nome === form.categoria)?.icone ?? 'fa-solid fa-star',
)

const preco = computed(() => (form.gratis ? 0 : Math.max(0, Number(form.preco) || 0)))

function formatarHora(hora: string) {
  const [h, m] = hora.split(':')
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`
}

const rotuloData = computed(() => {
  if (!form.data) return 'Data a definir'
  const dia = new Date(`${form.data}T12:00`)
  const texto = dia
    .toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(/\./g, '')
    .replace(',', '')
    .replace(' de ', ' ')
  const comMaiuscula = texto.charAt(0).toUpperCase() + texto.slice(1)
  return form.hora ? `${comMaiuscula} · ${formatarHora(form.hora)}` : comMaiuscula
})

// O card da prévia é o mesmo componente das listas, alimentado pelo que está no formulário
const previa = computed<Evento>(() => ({
  id: 0,
  titulo: form.titulo.trim() || 'Nome do evento',
  categorias: [form.categoria, form.tipo.trim()].filter(Boolean),
  data: rotuloData.value,
  inicio: `${form.data || hoje}T${form.hora || '20:00'}`,
  local: form.local.trim() || 'Local do evento',
  preco: preco.value,
  rotuloPreco: form.gratis ? 'entrada' : form.rotuloPreco,
  distanciaKm: 0,
  icone: icone.value,
  imagem: form.imagem || null,
  bairro: form.bairro,
  acessivel: form.acessivel,
  petFriendly: form.petFriendly,
  paraFamilia: form.paraFamilia,
}))

function carregarFoto(evento: Event) {
  const arquivo = (evento.target as HTMLInputElement).files?.[0]
  erros.imagem = ''
  if (!arquivo) return
  if (!arquivo.type.startsWith('image/')) {
    erros.imagem = 'Escolha um arquivo de imagem (JPG ou PNG).'
    return
  }

  const leitor = new FileReader()
  leitor.onload = () => {
    const imagem = new Image()
    imagem.onload = () => {
      // reduz para no máximo 1000px de largura, para a foto não pesar no banco
      const escala = Math.min(1, 1000 / imagem.width)
      const tela = document.createElement('canvas')
      tela.width = Math.round(imagem.width * escala)
      tela.height = Math.round(imagem.height * escala)
      tela.getContext('2d')?.drawImage(imagem, 0, 0, tela.width, tela.height)
      form.imagem = tela.toDataURL('image/jpeg', 0.82)
    }
    imagem.onerror = () => (erros.imagem = 'Não consegui abrir essa imagem. Tente outra.')
    imagem.src = leitor.result as string
  }
  leitor.readAsDataURL(arquivo)
}

function validar() {
  erros.titulo = form.titulo.trim() ? '' : 'Informe o nome do evento.'
  erros.data = form.data ? '' : 'Informe a data.'
  erros.hora = form.hora ? '' : 'Informe o horário.'
  erros.local = form.local.trim() ? '' : 'Informe o local.'
  erros.endereco = form.endereco.trim() ? '' : 'Informe o endereço, para o evento aparecer no mapa.'
  erros.preco =
    form.gratis || Number(form.preco) > 0 ? '' : 'Informe o valor ou marque como grátis.'
  erros.organizador = form.organizador.trim() ? '' : 'Informe quem organiza.'
  erros.geral = ''

  const campos: Campo[] = ['titulo', 'data', 'hora', 'local', 'endereco', 'preco', 'organizador']
  const primeiro = campos.find((campo) => erros[campo])
  if (primeiro) document.getElementById(`novo-${primeiro}`)?.focus()
  return !primeiro
}

function montarInformacoes(): InfoEvento[] {
  const informacoes: InfoEvento[] = []
  if (form.acessivel) {
    informacoes.push({
      icone: 'fa-solid fa-wheelchair',
      titulo: 'Acessível',
      descricao: 'Acesso para pessoas com deficiência',
    })
  }
  if (form.petFriendly) {
    informacoes.push({
      icone: 'fa-solid fa-paw',
      titulo: 'Pet friendly',
      descricao: 'Pets bem-vindos',
    })
  }
  if (form.paraFamilia) {
    informacoes.push({
      icone: 'fa-solid fa-children',
      titulo: 'Para família',
      descricao: 'Crianças bem-vindas',
    })
  }
  return informacoes
}

async function publicar() {
  if (publicando.value || !validar()) return

  publicando.value = true
  try {
    const endereco = form.endereco.trim()
    const coordenadas = await buscarCoordenadas(`${endereco}, ${form.bairro}`).catch(() => null)
    if (!coordenadas) {
      erros.endereco = 'Não encontramos esse endereço no mapa. Confira a rua e o número.'
      document.getElementById('novo-endereco')?.focus()
      return
    }

    const distanciaKm = distanciaDoCentro(coordenadas)
    const tags = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 6)

    const evento: NovoEvento = {
      titulo: form.titulo.trim(),
      categorias: previa.value.categorias,
      inicio: `${form.data}T${form.hora}`,
      local: form.local.trim(),
      bairro: form.bairro,
      acessivel: form.acessivel,
      petFriendly: form.petFriendly,
      paraFamilia: form.paraFamilia,
      preco: preco.value,
      rotuloPreco: previa.value.rotuloPreco,
      distanciaKm,
      icone: icone.value,
      destaque: form.destaque || null,
      imagem: form.imagem || null,
      detalheHorario: form.detalheHorario.trim() || `Início às ${formatarHora(form.hora)}`,
      endereco: `${endereco} · ${form.bairro}`,
      ...coordenadas,
      organizador: form.organizador.trim(),
      detalheOrganizador: 'Parceiro Evencon',
      interessados: 0,
      amigasInteressadas: [],
      sobre: form.sobre.trim(),
      tags: tags.length ? tags : [form.categoria.toLowerCase()],
      informacoes: montarInformacoes(),
      classificacao: form.classificacao,
      lote: form.gratis ? 'Entrada gratuita' : 'Ingressos à venda',
      linkCompra: form.linkCompra.trim(),
      // estimativa simples a partir da distância até o centro
      tempoDeCarro: `${Math.max(2, Math.round(distanciaKm * 2.2))} min de carro`,
    }

    const criado = await criarEvento(evento)
    router.push({ name: 'evento', params: { id: criado.id } })
  } catch (falha) {
    erros.geral = falha instanceof Error ? falha.message : 'Não foi possível publicar o evento.'
  } finally {
    publicando.value = false
  }
}
</script>

<template>
  <main class="pagina">
    <div v-if="!auth.admin" class="bloqueio">
      <i class="fa-solid fa-lock"></i>
      <h1>Área da administradora</h1>
      <p>Só a conta de administradora pode adicionar eventos.</p>
      <RouterLink to="/" class="botao-secundario">Voltar para o início</RouterLink>
    </div>

    <form v-else class="conteudo" novalidate @submit.prevent="publicar">
      <header class="topo">
        <p class="sobretitulo">Painel da administradora</p>
        <h1>Novo evento</h1>
        <p class="descricao">
          Cadastre um evento de parceiro. Ele aparece para todos assim que você publicar. Campos com
          <span class="obrigatorio">*</span> são obrigatórios.
        </p>
      </header>

      <div class="grade">
        <div class="formulario">
          <section class="bloco">
            <h2><i class="fa-regular fa-image"></i> Capa</h2>
            <label class="envio" for="novo-imagem">
              <i class="fa-regular fa-image"></i>
              <span>
                <b>{{ form.imagem ? 'Trocar foto' : 'Enviar foto do evento' }}</b>
                JPG ou PNG, de preferência na horizontal
              </span>
              <input id="novo-imagem" type="file" accept="image/*" @change="carregarFoto" />
            </label>
            <small v-if="erros.imagem" class="erro">{{ erros.imagem }}</small>
            <button v-if="form.imagem" type="button" class="link" @click="form.imagem = ''">
              Remover foto e usar a cor padrão
            </button>
          </section>

          <section class="bloco">
            <h2><i class="fa-regular fa-star"></i> Sobre o evento</h2>

            <div class="campo">
              <label for="novo-titulo">Nome do evento <span class="obrigatorio">*</span></label>
              <input
                id="novo-titulo"
                v-model="form.titulo"
                type="text"
                maxlength="80"
                placeholder="Ex.: Sarau de Primavera na Cidadela"
                :class="{ invalido: erros.titulo }"
              />
              <small v-if="erros.titulo" class="erro">{{ erros.titulo }}</small>
            </div>

            <div class="campo">
              <span class="rotulo">Categoria <span class="obrigatorio">*</span></span>
              <div class="chips">
                <button
                  v-for="categoria in categorias"
                  :key="categoria.nome"
                  type="button"
                  class="chip"
                  :class="{ ativo: form.categoria === categoria.nome }"
                  :aria-pressed="form.categoria === categoria.nome"
                  @click="form.categoria = categoria.nome"
                >
                  <i :class="categoria.icone"></i> {{ categoria.nome }}
                </button>
              </div>
            </div>

            <div class="campo">
              <label for="novo-tipo">Tipo</label>
              <input
                id="novo-tipo"
                v-model="form.tipo"
                type="text"
                maxlength="30"
                placeholder="Ex.: Show, Feira, Oficina, Festival"
              />
            </div>

            <div class="campo">
              <label for="novo-sobre">Descrição</label>
              <textarea
                id="novo-sobre"
                v-model="form.sobre"
                maxlength="600"
                placeholder="O que vai acontecer, atrações, o que levar…"
              ></textarea>
            </div>

            <div class="campo">
              <label for="novo-tags">Palavras-chave</label>
              <input
                id="novo-tags"
                v-model="form.tags"
                type="text"
                placeholder="poesia, música ao vivo, ao ar livre"
              />
              <small>Separe por vírgula.</small>
            </div>
          </section>

          <section class="bloco">
            <h2><i class="fa-regular fa-calendar"></i> Quando e onde</h2>

            <div class="dupla">
              <div class="campo">
                <label for="novo-data">Data <span class="obrigatorio">*</span></label>
                <input
                  id="novo-data"
                  v-model="form.data"
                  type="date"
                  :min="hoje"
                  :class="{ invalido: erros.data }"
                />
                <small v-if="erros.data" class="erro">{{ erros.data }}</small>
              </div>
              <div class="campo">
                <label for="novo-hora">Horário <span class="obrigatorio">*</span></label>
                <input
                  id="novo-hora"
                  v-model="form.hora"
                  type="time"
                  :class="{ invalido: erros.hora }"
                />
                <small v-if="erros.hora" class="erro">{{ erros.hora }}</small>
              </div>
            </div>

            <div class="campo">
              <label for="novo-detalhe">Informação de horário</label>
              <input
                id="novo-detalhe"
                v-model="form.detalheHorario"
                type="text"
                placeholder="Ex.: Portões abrem às 19h · duração 3h"
              />
            </div>

            <div class="campo">
              <label for="novo-local">Local <span class="obrigatorio">*</span></label>
              <input
                id="novo-local"
                v-model="form.local"
                type="text"
                placeholder="Ex.: Cidadela Cultural Antarctica"
                :class="{ invalido: erros.local }"
              />
              <small v-if="erros.local" class="erro">{{ erros.local }}</small>
            </div>

            <div class="dupla">
              <div class="campo">
                <label for="novo-endereco">Endereço <span class="obrigatorio">*</span></label>
                <input
                  id="novo-endereco"
                  v-model="form.endereco"
                  type="text"
                  placeholder="Rua, número"
                  :class="{ invalido: erros.endereco }"
                />
                <small v-if="erros.endereco" class="erro">{{ erros.endereco }}</small>
              </div>
              <div class="campo">
                <label for="novo-bairro">Bairro</label>
                <select id="novo-bairro" v-model="form.bairro">
                  <option v-for="bairro in bairros" :key="bairro">{{ bairro }}</option>
                </select>
              </div>
            </div>
          </section>

          <section class="bloco">
            <h2><i class="fa-solid fa-ticket"></i> Ingresso</h2>

            <div class="alternador" role="group" aria-label="Tipo de entrada">
              <button
                type="button"
                :class="{ ativo: form.gratis }"
                :aria-pressed="form.gratis"
                @click="form.gratis = true"
              >
                Grátis
              </button>
              <button
                type="button"
                :class="{ ativo: !form.gratis }"
                :aria-pressed="!form.gratis"
                @click="form.gratis = false"
              >
                Pago
              </button>
            </div>

            <div v-if="!form.gratis" class="dupla">
              <div class="campo">
                <label for="novo-preco">Valor em R$ <span class="obrigatorio">*</span></label>
                <input
                  id="novo-preco"
                  v-model="form.preco"
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  placeholder="40"
                  :class="{ invalido: erros.preco }"
                />
                <small v-if="erros.preco" class="erro">{{ erros.preco }}</small>
              </div>
              <div class="campo">
                <label for="novo-rotulo">Como mostrar o preço</label>
                <select id="novo-rotulo" v-model="form.rotuloPreco">
                  <option v-for="rotulo in rotulosPreco" :key="rotulo">{{ rotulo }}</option>
                </select>
              </div>
            </div>

            <div class="campo">
              <label for="novo-link">Link para comprar ou se inscrever</label>
              <input
                id="novo-link"
                v-model="form.linkCompra"
                type="url"
                placeholder="https://site-do-parceiro.com.br/ingressos"
              />
            </div>
          </section>

          <section class="bloco">
            <h2><i class="fa-solid fa-users"></i> Parceiro e detalhes</h2>

            <div class="campo">
              <label for="novo-organizador">
                Parceiro que organiza <span class="obrigatorio">*</span>
              </label>
              <input
                id="novo-organizador"
                v-model="form.organizador"
                type="text"
                placeholder="Ex.: Coletivo Palavra Viva"
                :class="{ invalido: erros.organizador }"
              />
              <small v-if="erros.organizador" class="erro">{{ erros.organizador }}</small>
            </div>

            <div class="campo">
              <span class="rotulo">Classificação indicativa</span>
              <div class="chips">
                <button
                  v-for="idade in classificacoes"
                  :key="idade"
                  type="button"
                  class="chip"
                  :class="{ ativo: form.classificacao === idade }"
                  :aria-pressed="form.classificacao === idade"
                  @click="form.classificacao = idade"
                >
                  {{ idade === 'L' ? 'Livre' : `${idade} anos` }}
                </button>
              </div>
            </div>

            <div class="campo">
              <span class="rotulo">Selo de destaque</span>
              <div class="chips">
                <button
                  v-for="selo in selos"
                  :key="selo.rotulo"
                  type="button"
                  class="chip"
                  :class="{ ativo: form.destaque === selo.valor }"
                  :aria-pressed="form.destaque === selo.valor"
                  @click="form.destaque = selo.valor"
                >
                  {{ selo.rotulo }}
                </button>
              </div>
              <small>Eventos com selo podem aparecer no card principal da tela inicial.</small>
            </div>

            <div class="campo">
              <span class="rotulo">Também é</span>
              <div class="chips">
                <button
                  type="button"
                  class="chip"
                  :class="{ ativo: form.acessivel }"
                  :aria-pressed="form.acessivel"
                  @click="form.acessivel = !form.acessivel"
                >
                  <i class="fa-solid fa-wheelchair"></i> Acessível
                </button>
                <button
                  type="button"
                  class="chip"
                  :class="{ ativo: form.petFriendly }"
                  :aria-pressed="form.petFriendly"
                  @click="form.petFriendly = !form.petFriendly"
                >
                  <i class="fa-solid fa-paw"></i> Pet friendly
                </button>
                <button
                  type="button"
                  class="chip"
                  :class="{ ativo: form.paraFamilia }"
                  :aria-pressed="form.paraFamilia"
                  @click="form.paraFamilia = !form.paraFamilia"
                >
                  <i class="fa-solid fa-children"></i> Para família
                </button>
              </div>
            </div>
          </section>
        </div>

        <aside class="lateral">
          <p class="sobretitulo apagado">Prévia do card</p>
          <EventCard :evento="previa" previa />
          <p class="nota">
            <i class="fa-solid fa-circle-info"></i>
            É assim que o evento aparece na tela inicial, na busca e nos salvos.
          </p>

          <p v-if="erros.geral" class="erro-geral" role="alert">{{ erros.geral }}</p>

          <button type="submit" class="botao-principal" :disabled="publicando">
            <i class="fa-solid fa-check"></i>
            {{ publicando ? 'Publicando...' : 'Publicar evento' }}
          </button>
          <RouterLink to="/perfil" class="botao-secundario">Cancelar</RouterLink>
        </aside>
      </div>
    </form>
  </main>
</template>

<style scoped>
.pagina {
  min-height: calc(100vh - 80px);
  background-color: #1f1019;
  color: white;
  font-family: 'DM Sans', sans-serif;
  padding: 32px 16px 64px;
}

.conteudo {
  max-width: 1040px;
  margin: 0 auto;
}

p,
h1,
h2 {
  margin: 0;
}

.sobretitulo {
  color: #c4b5fd;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.sobretitulo.apagado {
  color: rgba(255, 255, 255, 0.55);
}

.topo h1 {
  margin: 4px 0 8px;
  font-size: 28px;
}

.descricao {
  max-width: 620px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.45;
}

.obrigatorio {
  color: #f472b6;
}

.grade {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 32px;
  align-items: start;
  margin-top: 24px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bloco {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background-color: #2a1724;
}

.bloco h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.bloco h2 i {
  color: #f472b6;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.campo label,
.rotulo {
  color: #d9ccd8;
  font-size: 13px;
  font-weight: 700;
}

.campo small,
.bloco > small {
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
}

small.erro,
.erro-geral {
  color: #ff7a90;
}

.erro-geral {
  font-size: 13px;
}

input[type='text'],
input[type='url'],
input[type='number'],
input[type='date'],
input[type='time'],
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #593b55;
  border-radius: 12px;
  background-color: #1f1019;
  color: white;
  font-family: inherit;
  font-size: 14px;
  color-scheme: dark;
  outline: none;
  transition: border-color 0.2s;
}

textarea {
  height: 110px;
  padding: 12px 14px;
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #d946a7;
}

.invalido {
  border-color: #ff7a90 !important;
}

.dupla {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background-color: #1f1019;
  color: white;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s;
}

.chip:hover {
  border-color: #f472b6;
}

.chip.ativo {
  border-color: #ec4899;
  background-color: rgba(236, 72, 153, 0.18);
  color: #f472b6;
}

.envio {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.envio:hover,
.envio:focus-within {
  border-color: #f472b6;
}

.envio > i {
  font-size: 24px;
  color: #f472b6;
}

.envio span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.envio b {
  display: block;
  color: white;
  font-size: 14px;
}

.envio input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.link {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  color: #f472b6;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.alternador {
  display: flex;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  background-color: #1f1019;
}

.alternador button {
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.alternador button.ativo {
  background-color: white;
  color: #1f1019;
}

.lateral {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nota {
  display: flex;
  gap: 6px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  line-height: 1.4;
}

.botao-principal,
.botao-secundario {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border: none;
  border-radius: 999px;
  color: white;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.botao-principal {
  background-color: #db2777;
}

.botao-principal:hover:not(:disabled) {
  background-color: #be185d;
}

.botao-principal:disabled {
  opacity: 0.6;
  cursor: default;
}

.botao-secundario {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: #2a1724;
}

.botao-secundario:hover {
  border-color: #f472b6;
}

.bloqueio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 360px;
  margin: 48px auto 0;
  text-align: center;
}

.bloqueio > i {
  font-size: 34px;
  color: #f472b6;
}

.bloqueio h1 {
  font-size: 20px;
}

.bloqueio p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.bloqueio .botao-secundario {
  margin-top: 8px;
  padding: 0 20px;
  height: 40px;
  font-size: 13px;
}

@media (max-width: 860px) {
  .grade {
    grid-template-columns: 1fr;
  }

  .lateral {
    position: static;
  }
}

@media (max-width: 520px) {
  .dupla {
    grid-template-columns: 1fr;
  }
}
</style>
