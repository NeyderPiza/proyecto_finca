<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const animalStore = useAnimalStore()
const selectedYear = ref(new Date().getFullYear())

const availableYears = computed(() => {
  const years = animalStore.historicalMilkData.map(d => d.year)
  years.push(new Date().getFullYear())
  return years.sort((a, b) => b - a)
})

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

// Obtener todos los animales activos
const activeAnimals = computed(() => animalStore.activeAnimals)

// Obtener el resumen de producción de leche
const milkSummary = computed(() => animalStore.milkProductionSummary)

// Calcular edad de los animales
const calculateAge = (birthDate: string) => {
  return animalStore.calculateAge(birthDate)
}
</script>

<template>
  <div class="animate-fade-in p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-900">Informes</h1>
      <p class="text-gray-600">Resumen general de la finca</p>
    </div>

    <!-- Registro de Animales -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-blue-900 mb-4">Registro de Animales</h2>
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Especie</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Raza</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Edad</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Finca</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="animal in activeAnimals" :key="animal.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ animal.tagNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ animal.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ animal.species }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ animal.breed }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ calculateAge(animal.birthDate) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="{
                  'px-2 py-1 rounded-full text-xs font-medium': true,
                  'bg-green-100 text-green-800': animal.status === 'active',
                  'bg-red-100 text-red-800': animal.status === 'sold',
                  'bg-yellow-100 text-yellow-800': animal.status === 'sick'
                }">
                  {{ animal.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ animal.farm }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Resumen de Producción de Leche -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-blue-900">Registro de Producción de Leche</h2>
        <select
          v-model="selectedYear"
          class="px-4 py-2 rounded-lg border border-gray-300"
        >
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>

      <!-- Resumen General -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Total Litros</h3>
          <p class="text-2xl font-bold text-blue-600">
            {{ milkSummary.totalLiters.toLocaleString() }} L
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Ingresos Totales</h3>
          <p class="text-2xl font-bold text-green-600">
            {{ formatCurrency(milkSummary.totalIncome) }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Gastos Totales</h3>
          <p class="text-2xl font-bold text-red-600">
            {{ formatCurrency(milkSummary.totalExpenses) }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Balance Total</h3>
          <p class="text-2xl font-bold" :class="milkSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ formatCurrency(milkSummary.balance) }}
          </p>
        </div>
      </div>

      <!-- Desglose Mensual -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-4">Desglose Mensual</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Litros</th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Gastos</th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="data in milkSummary.monthlyData" :key="data.date">
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ format(parseISO(data.date), 'MMMM yyyy', { locale: es }) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ data.liters.toLocaleString() }} L
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {{ formatCurrency(data.income) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {{ formatCurrency(data.expenses) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" 
                    :class="data.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(data.balance) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Desglose por Finca -->
      <div class="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-4">Desglose por Finca</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(summary, farm) in milkSummary.byFarm" :key="farm" 
               class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-semibold text-blue-900 mb-2">{{ farm }}</h4>
            <div class="space-y-2">
              <p class="text-sm">
                <span class="text-gray-500">Litros:</span>
                <span class="font-medium ml-2">{{ summary.liters.toLocaleString() }} L</span>
              </p>
              <p class="text-sm">
                <span class="text-gray-500">Ingresos:</span>
                <span class="font-medium ml-2 text-green-600">{{ formatCurrency(summary.income) }}</span>
              </p>
              <p class="text-sm">
                <span class="text-gray-500">Gastos:</span>
                <span class="font-medium ml-2 text-red-600">{{ formatCurrency(summary.expenses) }}</span>
              </p>
              <p class="text-sm">
                <span class="text-gray-500">Balance:</span>
                <span class="font-medium ml-2" 
                      :class="summary.balance >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ formatCurrency(summary.balance) }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>