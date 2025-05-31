<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-900">Historial de Gastos</h1>
      <p class="text-gray-600">Registro histórico de todos los gastos realizados</p>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Finca</label>
          <select
            v-model="selectedFarm"
            class="w-full px-4 py-2 rounded-lg border border-gray-300"
          >
            <option value="">Todas las fincas</option>
            <option v-for="farm in availableFarms" :key="farm" :value="farm">
              {{ farm }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            v-model="selectedCategory"
            class="w-full px-4 py-2 rounded-lg border border-gray-300"
          >
            <option value="">Todas las categorías</option>
            <option value="supplement">Suplementos</option>
            <option value="medicine">Medicamentos</option>
            <option value="vaccine">Vacunas</option>
            <option value="other">Otros</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
          <input
            type="date"
            v-model="dateFrom"
            class="w-full px-4 py-2 rounded-lg border border-gray-300"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
          <input
            type="date"
            v-model="dateTo"
            class="w-full px-4 py-2 rounded-lg border border-gray-300"
          />
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Total Gastos</h3>
        <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalExpenses) }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Promedio Mensual</h3>
        <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(averageMonthlyExpenses) }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Total Registros</h3>
        <p class="text-2xl font-bold text-gray-700">{{ filteredExpenses.length }}</p>
      </div>
    </div>

    <!-- Tabla de Gastos -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Finca</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="expense in filteredExpenses" :key="expense.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ formatDate(expense.date) }}
              </td>
              <td class="px-6 py-4 text-sm">
                {{ expense.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="{
                  'px-2 py-1 rounded-full text-xs font-medium': true,
                  'bg-green-100 text-green-800': expense.category === 'supplement',
                  'bg-blue-100 text-blue-800': expense.category === 'medicine',
                  'bg-yellow-100 text-yellow-800': expense.category === 'vaccine',
                  'bg-gray-100 text-gray-800': expense.category === 'other'
                }">
                  {{ formatCategory(expense.category) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ expense.farm }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                {{ formatCurrency(expense.amount) }}
              </td>
            </tr>
            <tr v-if="filteredExpenses.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No se encontraron registros para los filtros seleccionados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { format, parseISO, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'

const animalStore = useAnimalStore()

// Estado local para filtros
const selectedFarm = ref('')
const selectedCategory = ref('')
const dateFrom = ref('')
const dateTo = ref('')

// Obtener fincas disponibles del store
const availableFarms = computed(() => animalStore.availableFarms)

// Formatear fechas
const formatDate = (date: string) => {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: es })
}

// Formatear moneda
const formatCurrency = (value: number) => {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

// Formatear categorías
const formatCategory = (category: string) => {
  const categories: { [key: string]: string } = {
    supplement: 'Suplementos',
    medicine: 'Medicamentos',
    vaccine: 'Vacunas',
    other: 'Otros'
  }
  return categories[category] || category
}

// Obtener todos los gastos combinados
const allExpenses = computed(() => {
  const expenses: any[] = []

  // Agregar gastos de producción de leche
  animalStore.milkProductions.forEach(prod => {
    prod.expenses.forEach(exp => {
      expenses.push({
        ...exp,
        farm: prod.farm,
        productionId: prod.id
      })
    })
  })

  // Agregar gastos de vacunaciones si tienen costo registrado
  animalStore.vaccinationRecords.forEach(vacc => {
    if (vacc.cost) {
      expenses.push({
        id: `vacc-${vacc.id}`,
        date: vacc.lastApplied,
        description: `Vacuna: ${vacc.name}`,
        amount: vacc.cost,
        category: 'vaccine',
        farm: 'Todas' // Las vacunas generalmente aplican a todas las fincas
      })
    }
  })

  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Filtrar gastos según los criterios seleccionados
const filteredExpenses = computed(() => {
  return allExpenses.value.filter(expense => {
    if (selectedFarm.value && expense.farm !== selectedFarm.value) return false
    if (selectedCategory.value && expense.category !== selectedCategory.value) return false
    
    if (dateFrom.value && dateTo.value) {
      const expenseDate = parseISO(expense.date)
      const from = parseISO(dateFrom.value)
      const to = parseISO(dateTo.value)
      if (!isWithinInterval(expenseDate, { start: from, end: to })) return false
    }
    
    return true
  })
})

// Calcular totales
const totalExpenses = computed(() => {
  return filteredExpenses.value.reduce((sum, exp) => sum + exp.amount, 0)
})

const averageMonthlyExpenses = computed(() => {
  if (filteredExpenses.value.length === 0) return 0
  
  const dates = filteredExpenses.value.map(exp => parseISO(exp.date))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  
  const monthsDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (30 * 24 * 60 * 60 * 1000)))
  
  return totalExpenses.value / monthsDiff
})
</script>
