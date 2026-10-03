<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalizacaoStore } from '@/stores/localizacao'

const router = useRouter()
const localizacao = useLocalizacaoStore()

// A tela é o passo 2 do cadastro, mas também abre pelas Configurações
const doCadastro = window.history.state?.doCadastro === true

const aneis = [120, 180, 240, 300]
const pedindo = ref(false)
const erro = ref('')

function seguir() {
  if (doCadastro) router.push({ name: 'home' })
  else router.back()
}

async function permitir() {
  if (pedindo.value) return
  pedindo.value = true
  erro.value = ''
  try {
    await localizacao.permitir()
    seguir()
  } catch (falha) {
    erro.value = falha instanceof Error ? falha.message : 'Não foi possível obter sua localização.'
  } finally {
    pedindo.value = false
  }
}

function agoraNao() {
  localizacao.recusar()
  seguir()
}
</script>

<template>
  <main class="pagina">
    <div class="conteudo">
      <div class="barra">
        <button type="button" class="botao-voltar" aria-label="Voltar" @click="router.back()">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <template v-if="doCadastro">
          <div class="progresso"><span></span></div>
          <button type="button" class="link" @click="agoraNao">Pular</button>
        </template>
      </div>

      <div class="arte" aria-hidden="true">
        <span
          v-for="(tamanho, i) in aneis"
          :key="tamanho"
          class="anel"
          :style="{ width: `${tamanho}px`, height: `${tamanho}px`, opacity: 0.5 - i * 0.1 }"
        ></span>
        <img src="/imgs/evencon-icone.png" alt="" />
        <span class="pino" style="left: 22%; top: 34%">
          <b><i class="fa-solid fa-music"></i> R$ 40</b>
        </span>
        <span class="pino lugar" style="left: 78%; top: 30%">
          <b><i class="fa-solid fa-beer-mug-empty"></i> Bar</b>
        </span>
        <span class="pino" style="left: 70%; top: 84%"><b>Grátis</b></span>
      </div>

      <div>
        <p class="sobretitulo">
          {{ doCadastro ? 'Passo 2 de 3 · Localização' : 'Localização' }}
        </p>
        <h1>Mostre o que está perto de você</h1>
        <p class="descricao">
          Com sua localização, a gente ordena eventos, bares e restaurantes pela distância e avisa
          quando tem algo legal no seu bairro.
        </p>
      </div>

      <ul class="garantias">
        <li><i class="fa-solid fa-shield-halved"></i> Usamos só enquanto o app está aberto</li>
        <li><i class="fa-solid fa-gear"></i> Você muda isso quando quiser no Perfil</li>
      </ul>

      <p v-if="localizacao.localizacao?.permitida && !doCadastro" class="estado">
        <i class="fa-solid fa-circle-check"></i> Localização ativada neste navegador.
      </p>

      <div class="acoes">
        <p v-if="erro" class="erro" role="alert">{{ erro }}</p>
        <button type="button" class="botao-principal" :disabled="pedindo" @click="permitir">
          <i class="fa-solid fa-location-crosshairs"></i>
          {{ pedindo ? 'Aguardando o navegador...' : 'Permitir localização' }}
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.pagina {
  min-height: calc(100dvh - 80px);
  display: flex;
  background-color: #1f1019;
  color: white;
  font-family: 'DM Sans', sans-serif;
  padding: 24px 16px 32px;
}

.conteudo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

p,
h1,
ul {
  margin: 0;
}

.barra {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 40px;
}

.botao-voltar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  background-color: #3a2334;
  color: white;
  cursor: pointer;
}

.progresso {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background-color: #3a2334;
  overflow: hidden;
}

.progresso span {
  display: block;
  width: 66%;
  height: 100%;
  border-radius: 3px;
  background-color: #ec4899;
}

.link {
  padding: 0;
  border: none;
  background: none;
  color: #f472b6;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

/* Ilustração */
.arte {
  position: relative;
  height: 250px;
}

.anel {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 1px solid #f472b6;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.arte img {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 96px;
  transform: translate(-50%, -50%);
}

.pino {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
}

.pino b {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 10px;
  border: 1.5px solid #ec4899;
  border-radius: 14px;
  background-color: #2a1724;
  font-size: 12px;
  white-space: nowrap;
}

.pino::after {
  content: '';
  width: 8px;
  height: 8px;
  margin-top: -5px;
  background-color: #ec4899;
  transform: rotate(45deg);
}

.pino.lugar b {
  border-color: #fb923c;
}

.pino.lugar::after {
  background-color: #fb923c;
}

/* Texto */
.sobretitulo {
  color: #f472b6;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 6px 0 8px;
  font-size: 26px;
  line-height: 1.2;
  text-wrap: balance;
}

.descricao {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.4;
}

.garantias {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  list-style: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.garantias i {
  width: 22px;
  color: #5fe3b0;
}

.estado {
  color: #5fe3b0;
  font-size: 14px;
}

.acoes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.erro {
  color: #ff7a90;
  font-size: 13px;
  text-align: center;
}

.botao-principal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 56px;
  border: none;
  border-radius: 999px;
  background-color: #db2777;
  color: white;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.botao-principal:hover:not(:disabled) {
  background-color: #be185d;
}

.botao-principal:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
