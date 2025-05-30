import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import AnimalList from '../views/AnimalList.vue'
import AnimalDetail from '../views/AnimalDetail.vue'
import AnimalForm from '../views/AnimalForm.vue'
import VaccinationSchedule from '../views/VaccinationSchedule.vue'
import Reports from '../views/Reports.vue'
import Finance from '../views/Finance.vue'
import MilkProduction from '../views/MilkProduction.vue'

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