# Evencon

O Evencon é uma aplicação web para descobrir eventos e lugares (bares, restaurantes e afins) em Joinville. Ele reúne num só lugar o que hoje fica espalhado entre redes sociais e sites de organizadores: a pessoa busca, filtra por data, preço, bairro e categoria, vê os detalhes do evento e como chegar, e guarda o que interessa.

O projeto é dividido em dois repositórios:

- **[frontEvencon](https://github.com/isacdcunha/backEvencon.git)**: a interface, em Vue 3.
- **[backEvencon](https://github.com/isacdcunha/backEvencon)**: a API de eventos e lugares, em FastApi.

## Funcionalidades implementadas

**Início (`/`)**
- Saudação conforme a hora do dia, com o nome de quem está logado.
- Evento em destaque, próximos eventos, eventos de hoje, lugares abertos e eventos grátis no fim de semana.
- Atalhos que abrem o Explorar já filtrado (Hoje, Este fim de semana, Grátis, Música, Bares...).

**Explorar (`/explorar`)**
- Busca por texto em eventos e lugares, com sugestões enquanto se digita.
- Filtros por tipo (eventos, lugares ou ambos), data, horário, preço, distância, categoria, bairro, acessibilidade, pet friendly e para família.
- Ordenação por relevância, proximidade, data ou menor preço.
- Buscas recentes guardadas no navegador.
- Navegação por categoria, com a contagem de eventos ou lugares de cada uma.
- Leitura de busca e filtros pela URL (`?q`, `?data`, `?preco`, `?categoria`, `?tipo`, `?ordem`).

**Página do evento (`/evento/:id`)**
- Data, local, organizador, descrição, tags, classificação indicativa e informações adicionais.
- Mapa com a localização do evento e rota de carro a partir da localização de quem acessa.
- Link "Como chegar" (abre o Google Maps) e link de compra no site do organizador.
- Lugares próximos e eventos semelhantes.
- Salvar e compartilhar o evento.

**Conta**
- Cadastro (`/cadastro`) com validação de nome, e-mail e senha, e login (`/login`).
- Perfil (`/perfil`) com edição de interesses, lista de eventos salvos e botão de sair.
- Eventos salvos separados por conta (ou como visitante).

Contas, interesses e salvos ficam só no `localStorage` do navegador — veja [Pendências](#pendências).

**API**
- Listagem e criação de eventos e lugares, criação em lote e busca de eventos semelhantes.
- Carga em massa a partir de arquivos JSON.

## Tecnologias

**Front-end**
- Vue 3 com TypeScript
- Vite
- Vue Router
- Pinia
- Leaflet, com mapa do OpenStreetMap e rotas do servidor público do OSRM (sem chave de API)
- Font Awesome e lucide-vue-next (ícones)
- Vitest, Vue Test Utils e jsdom (testes)
- Prettier
- Google Fonts

**Back-end**
- Python com FastAPI
- SQLAlchemy
- SQLite
- Pydantic (validação, via FastAPI)
- Uvicorn
- pytest

## Estrutura de pastas

**frontEvencon**

```
public/imgs/       logotipos e ícones do Evencon
src/
  assets/          CSS global e CSS compartilhado das telas de login e cadastro
  components/      cabeçalho, card de evento, card de lugar e mapa do evento
  data/            lista fixa de categorias
  router/          rotas da aplicação
  services/        chamadas à API (eventos e lugares) e contas no localStorage
  stores/          estado global com Pinia: sessão e eventos salvos
  types/           tipos TypeScript de evento, lugar e usuário
  views/           uma tela por rota
  __tests__/       testes unitários
```

**backEvencon**

```
app/
  main.py          cria a API e libera o acesso do front-end (CORS)
  banco.py         conexão com o banco
  modelos.py       tabelas
  esquemas.py      formato do JSON que entra e sai
  datas.py         textos de data em português
  carga.py         carga em massa a partir de dados/
  rotas/           rotas de eventos e de lugares
dados/             eventos e lugares da carga inicial, em JSON
tests/             testes da API
```

## Como rodar localmente

O front só mostra eventos e lugares com o back no ar. Suba o back primeiro.

### Back-end

Pré-requisito: Python 3 (feito e testado com 3.14; versões mais antigas não foram testadas).

```bash
git clone https://github.com/isacdcunha/backEvencon.git
cd backEvencon

python3 -m venv .venv
source .venv/bin/activate        # no Windows: .venv\Scripts\activate
pip install -r requirements.txt

python -m app.carga              # cria o banco e insere os dados de 'dados/'
uvicorn app.main:app --reload    # sobe a API em http://localhost:8000
```

Com a API no ar, http://localhost:8000/docs lista as rotas e permite testá-las pelo navegador.

Outros comandos:

```bash
python -m app.carga --recriar    # apaga o banco inteiro e carrega de novo
python -m pytest                 # roda os testes
```

### Front-end

Pré-requisito: Node.js `^22.18.0` ou `>=24.12.0`.

```bash
git clone https://github.com/isacdcunha/frontEvencon.git
cd frontEvencon

npm install
npm run dev                      # sobe o front em http://localhost:5173
```

Outros comandos:

```bash
npm run build                    # checa os tipos e gera a versão de produção
npm run preview                  # serve a versão de produção gerada
npm run type-check               # só a checagem de tipos
npm run test:unit                # roda os testes
npm run format                   # formata src/ com o Prettier
```

## Variáveis de ambiente

Todas são opcionais; sem elas, valem os padrões de desenvolvimento local.

**Front-end** (em um arquivo `.env.local`; há um modelo em `.env.example`)

| Variável | Para que serve |
|---|---|
| `VITE_API_URL` | Endereço da API |

**Back-end**

| Variável | Para que serve |
|---|---|
| `EVENCON_BANCO` | Endereço do banco de dados |
| `EVENCON_ORIGENS` | Endereços do front-end autorizados a chamar a API (CORS), separados por vírgula |

## Endpoints da API

| Método | Rota | O que faz |
|---|---|---|
| GET | `/eventos` | Lista os eventos em ordem de data, no formato resumido usado pelos cards |
| GET | `/eventos/{id}` | Retorna o evento completo, com os lugares próximos |
| GET | `/eventos/{id}/semelhantes` | Lista outros eventos, começando pelos que têm mais categorias em comum (`?limite=`, de 1 a 20, padrão 3) |
| POST | `/eventos` | Cria um evento |
| POST | `/eventos/lote` | Cria vários eventos de uma vez; se um falhar, nenhum é salvo |
| GET | `/lugares` | Lista os lugares em ordem de nome |
| POST | `/lugares` | Cria um lugar |
| POST | `/lugares/lote` | Cria vários lugares de uma vez; se um falhar, nenhum é salvo |

O JSON usa os mesmos nomes em camelCase dos tipos do front-end (`rotuloPreco`, `distanciaKm`, `lugaresProximos`...).

## Equipe

Pessoas com commits nos repositórios:

- Isabelle Cunha ([@isacdcunha](https://github.com/isacdcunha))
- Maria Helena Gonçalves da Costa ([@mariahgc](https://github.com/mariahgc))
- Kauany Deglmann ([@nydeglmann](https://github.com/nydeglmann))
- Ester Silva ([@estersilva0724](https://github.com/estersilva0724))
