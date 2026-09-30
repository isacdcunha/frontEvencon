import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/cadastro', name: 'cadastro', component: () => import('../views/CadastroView.vue') },
    { path: '/explorar', name: 'explorar', component: () => import('../views/ExplorarView.vue') },
    { path: '/salvos', name: 'salvos', component: () => import('../views/SalvosView.vue') },
    { path: '/perfil', name: 'perfil', component: () => import('../views/PerfilView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router