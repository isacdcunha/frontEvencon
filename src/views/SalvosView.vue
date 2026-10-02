<script setup lang="ts">
   import {ref, computed} from 'vue'
   import { useRouter } from 'vue-router'

   import {
      Heart,
      Sparkles,
      MapPin,
      User,
      Lock,
      ShieldCheck,
      ChevronLeft,
      ChevronRight,
      LogOut,
    } from 'lucide-vue-next'

   const router = useRouter()

   function voltar(){
    router.back()
   }

   function sair(){
    //logica do logout
    console.log('Usuário saiu da conta')
   }

   const lembrete = ref(true)
   const novidades = ref(true)
   const bairro = ref(false)
   const raio = ref(7)
   const progresso = computed(() => ((raio.value - 1) / (20 - 1)) * 100)

</script>

<template>
  <main class="paginas">  
    <header class="topo">
      <button class="botao-voltar" @click="voltar">
        <ChevronLeft :size="18" />
      </button>  
      <h1>Configurações</h1>
    </header>

    <h2 class="titulo-secao">NOTIFICAÇÕES</h2>

    <section class="grupo">
      <div class="linha">
        <span class="icone"><Heart :size="16" /></span>
        <div class="texto">
          <strong>Lembrete de evento salvo</strong>
          <small>1 dia antes e 2h antes</small>
        </div>
        <button :class="['toggle', {ligado: lembrete}]" @click="lembrete = !lembrete">
          <span class="bolinha"></span>
        </button>
      </div>

      <div class="linha">
        <span class="icone"><Sparkles :size="16" /></span>
        <div class="texto">
          <strong>Novidades da semana</strong>
          <small>Toda quinta, às 18h</small>
        </div>
        <button :class="['toggle', {ligado: novidades}]" @click="novidades = !novidades">
          <span class="bolinha"></span>
        </button>
      </div>

      <div class="linha">
        <span class="icone"><MapPin :size="16" /></span>
        <div class="texto">
          <strong>Eventos no meu bairro</strong>
          <small>Quando surgir algo perto</small>
        </div>
        <button :class="['toggle', {ligado: bairro}]" @click="bairro = !bairro">
          <span class="bolinha"></span>
        </button>
      </div>
    </section>

    <h2 class="titulo-secao">RAIO DE DISTÂNCIA PADRÃO</h2>

    <section class="grupo caixa-raio">
      <div class="raio-topo">
        <strong>Mostrar eventos até</strong>
        <span class="valor">{{raio}} km</span>
      </div>

      <input 
        v-model.number="raio"
        type="range"
        min="1"
        max="20"
        class="slider"
        :style="{ '--p': progresso + '%' }"
      />   

      <div class="raio-legenda">
        <small>1 km</small>
        <small>10 km</small>
        <small>20 km</small>
      </div>
    </section>

    <h2 class="titulo-secao">CONTA</h2>

    <section class="grupo">
      <div class="linha clicavel">
        <span class="icone">👤</span>
        <div class="texto">
          <strong>Dados da conta</strong>
        </div>
        <ChevronRight class="seta" :size="18" />
      </div>

      <div class="linha clicavel">
        <span class="icone">🔒</span>
        <div class="texto">
          <strong>Alterar senha</strong>
        </div>
        <ChevronRight class="seta" :size="18" />
      </div>

      <div class="linha clicavel">
        <span class="icone">🛡️</span>
        <div class="texto">
          <strong>Privacidade e localização</strong>
        </div>
        <ChevronRight class="seta" :size="18" />
      </div>
    </section>

    <button class="botao-sair" @click="sair">
      <LogOut :size="16" /> Sair da conta 
    </button>

  </main>
 </template>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  body {
    margin: 0;
    background: #1f131b;
  }
</style>

<style scoped>
.paginas {
  max-width: 560px;
  margin: 0 auto;
  padding: 36px 20px;
  color: #f6eef4;
  font-family: 'Plus Jakarta Sans', sans-serif; 
}

.topo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topo h1 {
  font-size: 22px;
  margin: 0;
}

.botao-voltar {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid #4a3244;
  background: #33202f;
  color: #fff;
  cursor: pointer;
}

.titulo-secao {
  margin: 24px 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #a58d9f;
}

.grupo {
  border: 1px solid #3a2634;
  border-radius: 16px;
  background: #2a1a26;
  overflow: hidden;
}

.linha {
  display: flex; 
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid #3a2634;
}

.linha:last-child {
  border-bottom: none;
}

.icone {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #3b2637;
  color: #ff6aa8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.texto {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.texto small {
  color:  #b9a3b3;
  font-size: 12px;
  margin-top: 2px;
}

.toggle {
  width: 46px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: #3d2b38;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle.ligado{
  background: #ff4fa0;
}

.bolinha{
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #c9aac4;
  transition: transform 0.2s;
}

.toggle.ligado .bolinha {
  transform: translateX(20px);
  background: #fff;  
}

.caixa-raio {
  padding: 16px;
}

.raio-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.valor {
  color: #ff6aa8;
  font-weight: 700;
}

.slider {
  width: 100%;
  margin: 14px 0 8px;
  accent-color: #ff4fa0;
  cursor: pointer;
}

.raio-legenda {
  display: flex;
  justify-content: space-between;
  color: #a58d9f;
  font-size: 11px;
}

.clicavel {
  cursor: pointer;
}

.clicavel:hover {
  background: #321b2d;
}

.seta {
  color: #a58d9f;
}

.botao-sair {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 28px auto 0;
  background: none;
  border: none; 
  color: #ff5a7a;
  font-family: inherit; 
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.botao-sair:hover {
  opacity: 0.8;
}

.texto strong {
  font-size: 15px;
  font-weight: 600;
}

.raio-topo strong {
  font-size: 15px;
  font-weight: 600;
}

</style>
