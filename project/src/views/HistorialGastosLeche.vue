<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { MilkProduction } from '../types'

const animalStore = useAnimalStore()
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

// Obtener todos los gastos del mes seleccionado
const monthlyExpenses = computed(() => {
  const allExpenses = []
  const productions = animalStore.milkProductions.filter(prod => {
    const prodDate = parseISO(prod.date)
    return prodDate.getFullYear() === selectedYear.value && 
           prodDate.getMonth() + 1 === selectedMonth.value
  })

  for (const production of productions) {
    for (const expense of production.expenses) {
      allExpenses.push({
        ...expense,
        date: production.date,
        farm: production.farm
      })
    }
  }

  return allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const monthlyStats = computed(() => {
  const stats = {
    month: format(new Date(selectedYear.value, selectedMonth.value - 1), 'MMMM yyyy', { locale: es }),
    totalExpenses: monthlyExpenses.value.reduce((sum, exp) => sum + exp.amount, 0),
    byCategory: {
      supplement: 0,
      medicine: 0,
      other: 0
    }
  }

  monthlyExpenses.value.forEach(expense => {
    stats.byCategory[expense.category] += expense.amount
  })

  return stats
})

const availableYears = computed(() => {
  const years = animalStore.historicalMilkData.map(d => d.year)
  years.push(new Date().getFullYear())
  return years.sort((a, b) => b - a)
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-900">Historial de Gastos - Producción de Leche</h1>
      <p class="text-gray-600">Consulta el detalle de todos los gastos registrados en la producción de leche</p>
    </div>

    <!-- Selectores de Año y Mes -->
    <div class="mb-6 flex gap-4">
      <div class="w-40">
        <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
        <select
          v-model="selectedYear"
          class="w-full px-4 py-2 rounded-lg border border-gray-300"
        >
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
      <div class="w-40">
        <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
        <select
          v-model="selectedMonth"
          class="w-full px-4 py-2 rounded-lg border border-gray-300"
        >
          <option v-for="month in 12" :key="month" :value="month">
            {{ new Date(2000, month - 1).toLocaleString('es', { month: 'long' }) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Resumen del Mes -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Gastos Totales</h3>
        <p class="text-2xl font-bold text-red-600">{{ formatCurrency(monthlyStats.totalExpenses) }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Suplementos</h3>
        <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(monthlyStats.byCategory.supplement) }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Medicamentos</h3>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(monthlyStats.byCategory.medicine) }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Otros Gastos</h3>
        <p class="text-2xl font-bold text-orange-600">{{ formatCurrency(monthlyStats.byCategory.other) }}</p>
      </div>
    </div>

    <!-- Lista de Gastos -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-blue-900">Detalle de Gastos - {{ monthlyStats.month }}</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Finca
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="monthlyExpenses.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No hay gastos registrados para este período
              </td>
            </tr>
            <tr v-for="expense in monthlyExpenses" :key="expense.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ format(parseISO(expense.date), 'dd/MM/yyyy') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ expense.farm }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ expense.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-blue-100 text-blue-800': expense.category === 'supplement',
                    'bg-green-100 text-green-800': expense.category === 'medicine',
                    'bg-orange-100 text-orange-800': expense.category === 'other'
                  }">
                  {{ expense.category === 'supplement' ? 'Suplemento' : 
                     expense.category === 'medicine' ? 'Medicamento' : 'Otro' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                {{ formatCurrency(expense.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>