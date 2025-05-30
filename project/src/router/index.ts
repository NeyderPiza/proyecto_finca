import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import AnimalList from '../views/AnimalLista.vue'
import AnimalDetail from '../views/AnimalDetalles.vue'
import AnimalForm from '../views/AnimalFormulario.vue'
import VaccinationSchedule from '../views/Vacunaciones.vue'
import Reports from '../views/Reportes.vue'
import Finance from '../views/Finanzas.vue'
import MilkProduction from '../views/ProduccionLeche.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Panel Principal',
      component: Dashboard
    },
    {
      path: '/animals',
      name: 'Animales',
      component: AnimalList
    },
    {
      path: '/animals/new',
      name: 'Nuevo Animal',
      component: AnimalForm
    },
    {
      path: '/animals/:id',
      name: 'Detalle del Animal',
      component: AnimalDetail,
      props: true
    },
    {
      path: '/animals/:id/edit',
      name: 'Editar Animal',
      component: AnimalForm,
      props: true
    },
    {
      path: '/vaccinations',
      name: 'Vacunaciones',
      component: VaccinationSchedule
    },
    {
      path: '/reports',
      name: 'Informes',
      component: Reports
    },
    {
      path: '/finance',
      name: 'Finanzas',
      component: Finance
    },
    {
      path: '/milk-production',
      name: 'Producción de Leche',
      component: MilkProduction
    }
  ]
})

export default router