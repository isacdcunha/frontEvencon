<script setup lang="ts">

</script>

<template>
  <main class="cadastro">

    <div class="topo">

      <button class="botao-voltar">
        ←
      </button>
  

    </div>

    <div class="cabecalho">

      <span class="passo">
        PASSO 1 DE 3
      </span>

      <h1>Crie sua conta</h1>


    </div>

    <form class="formulario">

    
      <div class="campo">

        <label for="nome">
          Nome
        </label>

        <div class="input-container">
          <span class="icone">☺</span>

          <input
            id="nome"
            type="text"
            placeholder="Qual é seu nome?"
          />
        </div>

      </div>

     
      <div class="campo">

        <label for="email">
          E-mail
        </label>

        <div class="input-container">
          <span class="icone">✉</span>

          <input
            id="email"
            type="email"
            placeholder="Exp: voce@email.com"
          />
        </div>

      </div>
      
      <div class="campo">

        <label for="senha">
          Senha
        </label>

        <div class="input-container">
          <span class="icone">⚿</span>

          <input
            id="senha"
            type="password"
            placeholder="Crie uma senha segura!"
          />
        </div>

  
        <small>
          Use no minimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números.
        </small>

      </div>


  

  
      <div class="campo">

        <label for="confirmarSenha">
          Confirmar senha
        </label>

        <div class="input-container">
          <span class="icone">⚿</span>

          <input
            id="confirmarSenha"
            type="password"
            placeholder="Repita a senha"
          />
        </div>

        <div class="mensagem">
  <span class="estrela">✦</span>

  <h2>Um universo de experiências<br>começa aqui.</h2>

  <span class="estrela">✦</span>
</div>

      </div>

      <p class="termos">
  Ao criar sua conta, você concorda com nossos Termos de Uso e Políticas de Privacidade :)
  
</p>
    
      <button
        type="submit"
        class="botao-cadastrar"
      >
        Criar conta
      </button>

    </form>

  
    <div class="login">

      <span>
        Já tem conta?
      </span>

      <a href="#">
        Entrar
      </a>

    </div>

  </main>
</template>


<style scoped>

* {
  box-sizing: border-box;
}


.cadastro {
  min-height: 100vh;
  width: 100%;
  padding: 24px;
  background: #190b17;
  color: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
}



.topo {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}



.botao-voltar {
  width: 58px;
  height: 58px;

  border-radius: 50%;
  border: 1px solid #4b3047;

  background: #2c1929;
  color: #ffffff;

  font-size: 32px;
  font-weight: 300;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
}



.cabecalho {
  width:40% ;
  margin: 0 auto 28px;
}


.passo {
  color: #ef68ae;

  font-size: 16px;
  font-weight: bold;

  letter-spacing: 1.5px;
}


h1 {
  margin: 6px 0 0;

  font-size: 38px;
  line-height: 1.1;
}


.cabecalho p {
  margin: 5px 0 0;

  color: #aa9baa;
  font-size: 20px;
}

.termos {
  color: #9f8b9d;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  margin: 4px 10px 24px;
}

.formulario {
  width: 40%;
  margin: 0 auto;
}



.campo {
  margin-bottom: 24px;
}


.campo label {
  display: block;

  margin-bottom: 9px;

  color: #d9ccd8;

  font-size: 18px;
  font-weight: bold;
}


.input-container {
  height: 76px;

  display: flex;
  align-items: center;

  border: 2px solid #593b55;
  border-radius: 22px;

  background: #2b1727;

  padding: 0 20px;

  transition: 0.2s;
}


.input-container:focus-within {
  border-color: #d946a7;
}


.icone {
  width: 35px;

  color: #a993a8;

  font-size: 25px;
}


.input-container input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;

  background: transparent !important;

  color: white;
  font-size: 20px;
}


.input-container {
  background: #2b1727;
}


.requisitos {
  display: flex;
  gap: 5px;

  margin-top: 8px;
  width: 40%;
}


.requisitos span {
  height: 5px;
  flex: 1;

  border-radius: 10px;

  background: #543650;
}


.requisitos span:first-child {
  background: #ed3c9d;
}


.campo small {
  display: block;

  margin-top: 8px;

  color: #a993a8;

  font-size: 15px;
}



.check {
  width: 29px;
  height: 29px;

  flex-shrink: 0;

  border-radius: 7px;

  background: #ef3198;

  position: relative;
}


.check::after {
  content: "✓";

  position: absolute;

  left: 6px;
  top: 2px;

  color: white;

  font-size: 20px;
  font-weight: bold;
}


.botao-cadastrar {
  width: 100%;
  height: 78px;

  border: none;
  border-radius: 40px;

  background: linear-gradient(
    100deg,
    #df218d,
    #b83de0
  );

  color: white;

  font-size: 22px;
  font-weight: bold;

  cursor: pointer;

  box-shadow:
    0 10px 30px rgba(220, 35, 150, 0.25);

  transition: 0.2s;
}


.botao-cadastrar:hover {
  transform: translateY(-2px);

  box-shadow:
    0 14px 35px rgba(220, 35, 150, 0.4);
}


.login {
  text-align: center;

  margin-top: 26px;

  color: #a993a8;

  font-size: 17px;
}

.mensagem {
  text-align: center;
  margin: 25px 0 30px;
}

.mensagem h2 {
  color: #e85aa9;
  font-size: 22px;
  font-weight: 500;
  line-height: 1.3;
}

.estrela {
  color: #b94be2;
  font-size: 18px;
}

.login a {
  color: #ed55a9;

  font-weight: bold;

  text-decoration: none;
}


.login a:hover {
  text-decoration: underline;
}

</style>