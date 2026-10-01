<script setup lang="ts">
//Filtro
const categorias = ['Música', 'Festas', 'Gastronomia', 'Bares', 'Cultura', 'Esportes',
  'Tecnologia', 'Família', 'Ao ar livre', 'Dança', 'Humor', 'Feiras']
const bairros = ['Centro', 'América', 'Glória', 'Atiradores', 'Saguaçu', 'Bucarein', 'Boa Vista']

</script>
<template>
  <main>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.3.1/css/fontawesome.css"
      integrity="sha512-cOd3Jjo4vXG7cyt5/gEQgxwL6c7THvNQxSZphogpsFKsnbgeqEWa7Xsyf7zvDMpdmDAhiUUJGQPc5R3pocvnBQ=="
      crossorigin="anonymous" referrerpolicy="no-referrer">
  </main>

    <form class="busca">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input
        type="search"
        placeholder="Buscar evento, lugar ou artista"  >
    </form>


  <div class="container">
    <div class="filtro-wrapper">
      <div class="filtro-container">
        <div class="menu-filtragem">
          <h3><i class="fa-solid fa-sliders"></i> Filtros</h3>
          <p>Limpar</p>
        </div>
        <div class="linha"></div>

        <div class="filtro-scroll">
          <div class="filtro-grupo">
            <p class="grupo-titulo">Tipo</p>
            <div class="filtragem-tipo">
              <button class="opcao-tipo">Eventos</button>
              <button class="opcao-tipo">Lugares</button>
              <button class="opcao-tipo ativo">Ambos</button>
            </div>
          </div>

          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Data</p>
              <span class="grupo-limpar">Qualquer dia</span>
            </div>
            <div class="chips">
              <button class="chip">Hoje</button>
              <button class="chip">Amanhã</button>
              <button class="chip">Fim de semana</button>
              <button class="chip">Escolher data</button>
            </div>
          </div>
          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Horário</p>
              <span class="grupo-limpar">Qualquer horário</span>
            </div>
            <div class="chips">
              <button class="chip">Manhã</button>
              <button class="chip">Tarde</button>
              <button class="chip">Noite</button>
            </div>
          </div>
          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Preço</p>
              <span class="grupo-limpar">Qualquer preço</span>
            </div>
            <div class="chips">
              <button class="chip">Grátis</button>
              <button class="chip">Até R$ 50</button>
              <button class="chip">Até R$ 100</button>
            </div>
            <input type="range" min="0" max="150" value="150" class="slider" />
            <div class="slider-legenda"><span>R$ 0</span><span>R$ 75</span><span>R$ 150+</span></div>
          </div>
          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Distância</p>
              <span class="grupo-limpar">Qualquer distância</span>
            </div>
            <input type="range" min="1" max="20" value="20" class="slider" />
            <div class="slider-legenda"><span>1 km</span><span>10 km</span><span>20 km+</span></div>
          </div>
          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Categoria</p>
              <span class="grupo-limpar">Todas</span>
            </div>
            <div class="chips">
              <button class="chip" v-for="c in categorias" :key="c">{{ c }}</button>
            </div>
          </div>
          <div class="filtro-grupo">
            <div class="grupo-cabecalho">
              <p class="grupo-titulo">Bairro</p>
              <span class="grupo-limpar">Todos</span>
            </div>
            <div class="chips">
              <button class="chip" v-for="b in bairros" :key="b">{{ b }}</button>
            </div>
          </div>
          <div class="filtro-grupo">
            <p class="grupo-titulo">Mais opções</p>
            <div class="chips">
              <button class="chip">Acessível</button>
              <button class="chip">Pet friendly</button>
              <button class="chip">Para família</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="categorias-container">
      <div class="menu-recente">
        <h2 class="busca-recente">Busca Recente</h2>
        <p class="limpar-recentes">Limpar</p>
      </div>
      <div class="busca-recente-container">
        <div class="filtro-recente">esporte</div>
        <div class="filtro-recente">culinaria</div>
        <div class="filtro-recente">natureza</div>
      </div>
      <h1 class="categoria">Categorias</h1>
      <div class="cards-container">
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-music"></i></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-champagne-glasses"></i></div>
          <h1 class="titulo-card">Festas</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-utensils"></i></div>
          <h1 class="titulo-card">Gatronomia</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-brands fa-untappd"></i></div>
          <h1 class="titulo-card">Bares</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-building-columns"></i></div>
          <h1 class="titulo-card">Cultura</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-futbol"></i></div>
          <h1 class="titulo-card">Esportes</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-code"></i></div>
          <h1 class="titulo-card">Tecnologia</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-people-roof"></i></div>
          <h1 class="titulo-card">Família</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-tree"></i></div>
          <h1 class="titulo-card">Ao ar livre</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-person-walking"></i></div>
          <h1 class="titulo-card">Dança</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-microphone"></i></div>
          <h1 class="titulo-card">Humor</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"><i class="fa-solid fa-store"></i></div>
          <h1 class="titulo-card">Feiras</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');



/*global */
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
  margin: 0 auto;
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


/*Filtragem css*/
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

.card {
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

.card:hover {
  transform: translateY(-3px);
  filter: brightness(1.08);
}

.card::after {
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

.card:nth-child(1),
.card:nth-child(5),
.card:nth-child(9) {
  --gradiente: linear-gradient(135deg, #f04fb0 0%, #7b4aa8 100%);
}

.card:nth-child(2),
.card:nth-child(6),
.card:nth-child(10) {
  --gradiente: linear-gradient(135deg, #ff9a56 0%, #c2306f 100%);
}

.card:nth-child(3),
.card:nth-child(7),
.card:nth-child(11) {
  --gradiente: linear-gradient(135deg, #e8479f 0%, #7a1f55 100%);
}

.card:nth-child(4),
.card:nth-child(8),
.card:nth-child(12) {
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
  margin: 20px auto 0;
}

</style>
