export interface Categoria {
  nome: string
  icone: string
}

export const categorias: Categoria[] = [
  { nome: 'Música', icone: 'fa-solid fa-music' },
  { nome: 'Festas', icone: 'fa-solid fa-champagne-glasses' },
  { nome: 'Gastronomia', icone: 'fa-solid fa-utensils' },
  { nome: 'Bares', icone: 'fa-brands fa-untappd' },
  { nome: 'Cultura', icone: 'fa-solid fa-building-columns' },
  { nome: 'Esportes', icone: 'fa-solid fa-futbol' },
  { nome: 'Tecnologia', icone: 'fa-solid fa-code' },
  { nome: 'Família', icone: 'fa-solid fa-people-roof' },
  { nome: 'Ao ar livre', icone: 'fa-solid fa-tree' },
  { nome: 'Dança', icone: 'fa-solid fa-person-walking' },
  { nome: 'Humor', icone: 'fa-solid fa-microphone' },
  { nome: 'Feiras', icone: 'fa-solid fa-store' },
]
