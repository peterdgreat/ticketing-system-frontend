import { createRouter, createWebHistory } from 'vue-router'
import SignUpView from '@/views/SignUpView.vue'
import LoginView from '@/views/LoginView.vue'
import TicketForm from '@/components/TicketForm.vue'
import TicketsView from '@/views/TicketsView.vue'
import TicketView from '@/views/TicketView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TicketsView,
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: TicketsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tickets/:id',
      component:TicketView,
      meta: { requiresAuth: true },
    }

  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  console.log(`Router: To ${to.path}, user:`, authStore.user);
  if (to.meta.requiresAuth) {
    const restored = await authStore.restoreUser();
    console.log('Router: Restored user:', authStore.user);
    if (!restored || !authStore.user) {
      console.log('Router: No user, redirecting');
      next('/login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router
