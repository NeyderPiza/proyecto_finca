import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Dashboard from '../views/Dashboard.vue'
import AnimalList from '../views/AnimalLista.vue'
import AnimalDetail from '../views/AnimalDetalles.vue'
import AnimalForm from '../views/AnimalFormulario.vue'
import VaccinationSchedule from '../views/Vacunaciones.vue'
import Reports from '../views/Reportes.vue'
import Finance from '../views/Finanzas.vue'
import MilkProduction from '../views/ProduccionLeche.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      name: 'Panel Principal',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/animals',
      name: 'Animales',
      component: AnimalList,
      meta: { requiresAuth: true }
    },
    {
      path: '/animals/new',
      name: 'Nuevo Animal',
      component: AnimalForm,
      meta: { requiresAuth: true }
    },
    {
      path: '/animals/:id',
      name: 'Detalle del Animal',
      component: AnimalDetail,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/animals/:id/edit',
      name: 'Editar Animal',
      component: AnimalForm,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/vaccinations',
      name: 'Vacunaciones',
      component: VaccinationSchedule,
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'Informes',
      component: Reports,
      meta: { requiresAuth: true }
    },
    {
      path: '/finance',
      name: 'Finanzas',
      component: Finance,
      meta: { requiresAuth: true }
    },
    {
      path: '/milk-production',
      name: 'Producción de Leche',
      component: MilkProduction,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Si la página requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  // Si el usuario está autenticado e intenta acceder al login, redirigir al dashboard
  if (to.path === '/login' && authStore.isAuthenticated) {
    return '/'
  }
})

export default router