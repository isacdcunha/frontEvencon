<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import EventCard from '@/components/EventCard.vue'
import { categorias } from '@/data/categorias'
import { listarEventos } from '@/services/eventos'
import { useAuthStore } from '@/stores/auth'
import { useEventosStore } from '@/stores/eventos'
import { useSalvosStore } from '@/stores/salvos'
import type { Evento } from '@/types/evento'

const router = useRouter()
const auth = useAuthStore()
const salvos = useSalvosStore()
const eventosStore = useEventosStore()

const eventos = ref<Evento[]>([])
const editandoInteresses = ref(false)
const erro = ref(false)

onMounted(async () => {
  try {
    eventos.value = await listarEventos()
  } catch {
    erro.value = true
  }
})

const interesses = computed(() => auth.usuario?.interesses ?? [])

const categoriasVisiveis = computed(() =>
  editandoInteresses.value
    ? categorias
    : categorias.filter((categoria) => interesses.value.includes(categoria.nome)),
)

const eventosNoAr = computed(
  () => eventos.value.filter((evento) => !eventosStore.apagados.includes(evento.id)).length,
)

const eventosSalvos = computed(() => eventos.value.filter((evento) => salvos.tem(evento.id)))

function alternarInteresse(nome: string) {
  auth.atualizarInteresses(
    interesses.value.includes(nome)
      ? interesses.value.filter((item) => item !== nome)
      : [...interesses.value, nome],
  )
}

function sair() {
  auth.sair()
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="pagina">
    <div v-if="!auth.usuario" class="visitante">
      <img src="/imgs/evencon-icone.png" alt="" />
      <h1>Você está explorando sem conta</h1>
      <p>Crie uma conta para salvar eventos e personalizar o que aparece para você.</p>
      <RouterLink to="/cadastro" class="botao-principal">Criar conta grátis</RouterLink>
      <RouterLink to="/login" class="link">Já tenho conta</RouterLink>
    </div>

    <div v-else class="conteudo">
      <header class="topo">
        <span class="avatar">{{ auth.usuario.nome[0]?.toUpperCase() }}</span>
        <div class="identificacao">
          <h1>{{ auth.usuario.nome }}</h1>
          <span v-if="auth.admin" class="selo-admin">
            <i class="fa-solid fa-shield-halved"></i> Administradora
          </span>
          <p>{{ auth.usuario.email }}</p>
        </div>
        <RouterLink
          :to="{ name: 'configuracoes' }"
          class="botao-configuracoes"
          aria-label="Configurações"
        >
          <i class="fa-solid fa-gear"></i>
        </RouterLink>
        <button type="button" class="botao-sair" @click="sair">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair
        </button>
      </header>

      <section v-if="auth.admin" class="painel-admin">
        <div>
          <p class="sobretitulo">Painel da administradora</p>
          <h2>Eventos dos parceiros</h2>
          <p class="dica">
            {{ eventosNoAr }} no ar. Para apagar um evento, use a lixeira dele em qualquer lista.
          </p>
        </div>
        <RouterLink :to="{ name: 'novo-evento' }" class="botao-principal">
          <i class="fa-solid fa-plus"></i> Adicionar evento
        </RouterLink>
      </section>

      <section>
        <div class="cabecalho-secao">
          <h2>Meus interesses</h2>
          <button type="button" class="link" @click="editandoInteresses = !editandoInteresses">
            {{ editandoInteresses ? 'Concluir' : 'Editar' }}
          </button>
        </div>

        <p v-if="editandoInteresses" class="dica">Toque para marcar ou desmarcar.</p>

        <div class="chips">
          <template v-if="editandoInteresses">
            <button
              v-for="categoria in categoriasVisiveis"
              :key="categoria.nome"
              type="button"
              class="chip"
              :class="{ ativo: interesses.includes(categoria.nome) }"
              :aria-pressed="interesses.includes(categoria.nome)"
              @click="alternarInteresse(categoria.nome)"
            >
              <i :class="categoria.icone"></i> {{ categoria.nome }}
            </button>
          </template>
          <template v-else>
            <span v-for="categoria in categoriasVisiveis" :key="categoria.nome" class="chip">
              <i :class="categoria.icone"></i> {{ categoria.nome }}
            </span>
            <button type="button" class="chip tracejado" @click="editandoInteresses = true">
              <i class="fa-solid fa-plus"></i> Adicionar
            </button>
          </template>
        </div>
      </section>

      <section>
        <div class="cabecalho-secao">
          <h2>
            Salvos <span class="contagem">{{ eventosSalvos.length }}</span>
          </h2>
        </div>

        <p v-if="erro" class="vazio" role="alert">
          Não foi possível carregar seus eventos salvos. Verifique se o servidor está no ar.
        </p>
        <div v-else-if="eventosSalvos.length" class="grade">
          <EventCard v-for="evento in eventosSalvos" :key="evento.id" :evento="evento" />
        </div>
        <div v-else class="vazio">
          <i class="fa-regular fa-heart"></i>
          <h3>Nada salvo ainda</h3>
          <p>Toque no coração de um evento para guardar aqui.</p>
          <RouterLink to="/explorar" class="botao-secundario">Explorar eventos</RouterLink>
        </div>
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
  padding: 32px 16px 64px;
}

.conteudo {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 860px;
  margin: 0 auto;
}

p,
h1,
h2,
h3 {
  margin: 0;
}

.link {
  padding: 0;
  border: none;
  background: none;
  color: #f472b6;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

/* Sem conta */
.visitante {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 360px;
  margin: 48px auto 0;
  text-align: center;
}

.visitante img {
  width: 80px;
}

.visitante h1 {
  font-size: 20px;
}

.visitante p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.45;
}

.botao-principal {
  margin-top: 8px;
  padding: 14px 24px;
  border-radius: 999px;
  background-color: #db2777;
  color: white;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: background-color 0.2s;
}

.botao-principal:hover {
  background-color: #be185d;
}

/* Administração */
.selo-admin {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  padding: 3px 9px;
  border-radius: 999px;
  background-color: #7c3aed;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.painel-admin {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(167, 139, 250, 0.35);
  border-radius: 16px;
  background-color: rgba(124, 58, 237, 0.12);
}

.painel-admin h2 {
  margin-top: 4px;
  font-size: 18px;
}

.painel-admin .dica {
  margin: 6px 0 0;
}

.painel-admin .botao-principal {
  margin-top: 0;
}

.sobretitulo {
  color: #c4b5fd;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* Topo */
.topo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ec4899, #c026d3);
  font-size: 32px;
  font-weight: 800;
}

.identificacao {
  flex: 1;
  min-width: 0;
}

.identificacao h1 {
  font-size: 22px;
  overflow-wrap: anywhere;
}

.identificacao p {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.botao-configuracoes {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  background-color: #2a1724;
  color: white;
  text-decoration: none;
  transition: border-color 0.2s;
}

.botao-configuracoes:hover {
  border-color: #f472b6;
}

.botao-sair {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background-color: #2a1724;
  color: white;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.2s;
}

.botao-sair:hover {
  border-color: #f472b6;
}

/* Seções */
.cabecalho-secao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cabecalho-secao h2 {
  font-size: 18px;
}

.contagem {
  margin-left: 4px;
  color: #f472b6;
}

.dica {
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
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
  background-color: #2a1724;
  color: white;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
}

button.chip {
  cursor: pointer;
  transition: border-color 0.2s;
}

button.chip:hover {
  border-color: #f472b6;
}

.chip.ativo {
  border-color: #ec4899;
  background-color: rgba(236, 72, 153, 0.18);
  color: #f472b6;
}

.chip.tracejado {
  border-style: dashed;
  background: none;
  color: #f472b6;
}

.grade {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 36px 20px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  text-align: center;
}

.vazio > i {
  margin-bottom: 4px;
  font-size: 34px;
  color: #f472b6;
}

.vazio h3 {
  font-size: 18px;
}

.vazio p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.botao-secundario {
  margin-top: 8px;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background-color: #3a2334;
  color: white;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 760px) {
  .grade {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .topo {
    flex-wrap: wrap;
  }

  .avatar {
    width: 64px;
    height: 64px;
    font-size: 24px;
  }

  .grade {
    grid-template-columns: 1fr;
  }
}
</style>
