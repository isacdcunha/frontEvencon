<script setup lang="ts">
</script>
<template>
  <main>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.3.1/css/fontawesome.css"
      integrity="sha512-cOd3Jjo4vXG7cyt5/gEQgxwL6c7THvNQxSZphogpsFKsnbgeqEWa7Xsyf7zvDMpdmDAhiUUJGQPc5R3pocvnBQ=="
      crossorigin="anonymous" referrerpolicy="no-referrer">
  </main>
  <div class="barra-pesquisa">
    <div class="lupa-pesquisa"><i class="fa-solid fa-magnifying-glass"></i></div>
    <h2 class="frase-pesquisa">Buscar evento, lugar ou artista</h2>
  </div>



  <div class="container">
    <div class="filtro-container">
      <div class="menu-filtragem">
        <div class="icone-filtragem"></div>
        <h3><i class="fa-solid fa-sliders"></i>Filtros</h3>
        <p>Limpar</p>
      </div>
      <div class="linha"></div>

      <p class="tipo">Tipo</p>
      <div class="filtragem-tipo">
        <p class="eventos-tipo">Eventos</p>
        <p class="lugares-tipo">Lugares</p>
        <p class="ambos-tipo">Ambos</p>
      </div>
    </div>




    <div class="categorias-container">
      <div class="busca-recente-container">
        <h2 class="busca">Busca Recente</h2>
        <div class="filtro-recente"></div>
        <div class="filtro-recente"></div>
        <div class="filtro-recente"></div>
        <p class="limpar-recentes">Limpar</p>
      </div>
      <h1 class="categoria">Categorias</h1>
      <div class="cards-container">
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
        <div class="card">
          <div class="icone-card"></div>
          <h1 class="titulo-card">Música</h1>
          <p class="quant-eventos-card">3 eventos</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');

.cards-container{
  display: grid;
  grid-template-columns: 315px 315px 315px;
  width: 980px;
  background-color: #36ad26;
  gap: 10px;
}

.card{
  border-radius: 20px;
  height: 180px;
  background-color: #412233;
}

.busca-recente-container{
  display: flex;
  gap: 180px;
  color: #ffff;
  font-size: 1rem;
}

.categoria{
  color: #ffff;
  font-size: 1.2rem;
}




/*global */
:global(body) {
  background-color: #2e0a1e;
  font-family: 'DM Sans', sans-serif;
}

/*barra de pesquisa*/
.barra-pesquisa {
  background-color: #412233;
  width: 95%;
  height: 50px;
  border-radius: 50px;
  margin: 0 auto;
  border: 2px #70475e solid;
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 0.8rem;
  color: #adacad4b;
}

.lupa-pesquisa {
  margin-left: 20px;
}

/*conteudo*/

.container {
  display: grid;
  grid-template-columns: 30% 1fr;
  width: 95%;
  gap: 30px;
  margin: 40px auto 0;
}

/*filtragem*/
.filtro-container {
  background-color: #412233;
  border-radius: 30px;
  height: 500px;
  
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

.filtragem-tipo {
  border: #70475e 1px solid;
  border-radius: 50px;
  width: 300px;
  display: flex;
  gap: 40px;
  color: #ffff;
  justify-content: center;
  margin: 0 auto;
  font-weight: bold;

}

.filtragem-tipo p:hover {
  background-color: #36ad26;
  width: 100%;
  height: 20px;
}
</style>
