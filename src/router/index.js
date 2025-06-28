import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SignUpView from '@/components/SignUpView.vue'
import LoginView from '@/components/LoginView.vue'
import TicketForm from '@/components/TicketForm.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/ticketform',
      name: 'ticketform',
      component: TicketForm,
    },

  ],
})

export default router
