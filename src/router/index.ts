import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/cadastro', name: 'cadastro', component: () => import('../views/CadastroView.vue') },
    { path: '/explorar', name: 'explorar', component: () => import('../views/ExplorarView.vue') },
    // os eventos salvos ficam no perfil
    { path: '/salvos', redirect: '/perfil' },
    {
      path: '/configuracoes',
      name: 'configuracoes',
      component: () => import('../views/ConfiguracoesView.vue'),
    },
    {
      path: '/localizacao',
      name: 'localizacao',
      component: () => import('../views/LocalizacaoView.vue'),
    },
    { path: '/perfil', name: 'perfil', component: () => import('../views/PerfilView.vue') },
    { path: '/evento/:id', name: 'evento', component: () => import('../views/EventoView.vue') },
    {
      path: '/admin/evento/novo',
      name: 'novo-evento',
      component: () => import('../views/NovoEventoView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
