<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const animalStore = useAnimalStore()
const router = useRouter()

const upcomingVaccinations = computed(() => animalStore.upcomingVaccinations)
const cattleCount = computed(() => animalStore.cattleCount)
const horseCount = computed(() => animalStore.horseCount)
const financialSummary = computed(() => animalStore.financialSummary)
const activeAnimals = computed(() => animalStore.activeAnimals)

const getAgeGroup = (birthDate: string) => {
  const today = new Date()
  const birth = new Date(birthDate)
  const ageInMonths = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
  
  if (ageInMonths < 12) return '0-12 meses'
  if (ageInMonths < 24) return '1-2 años'
  if (ageInMonths < 36) return '2-3 años'
  return '3+ años'
}

const chartData = computed(() => {
  const ageGroups = ['0-12 meses', '1-2 años', '2-3 años', '3+ años']
  const maleData = new Array(ageGroups.length).fill(0)
  const femaleData = new Array(ageGroups.length).fill(0)

  activeAnimals.value.forEach(animal => {
    const ageGroup = getAgeGroup(animal.birthDate)
    const index = ageGroups.indexOf(ageGroup)
    if (animal.gender === 'male') {
      maleData[index]++
    } else {
      femaleData[index]++
    }
  })

  return {
    labels: ageGroups,
    datasets: [
      {
        label: 'Machos',
        backgroundColor: '#3b82f6',
        data: maleData,
        borderRadius: 6
      },
      {
        label: 'Hembras',
        backgroundColor: '#ec4899',
        data: femaleData,
        borderRadius: 6
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          return `${context.dataset.label}: ${context.raw} animales`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
}

const recentAnimals = computed(() => {
  return [...activeAnimals.value]
    .sort((a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime())
    .slice(0, 3)
})

const goToAnimalDetail = (id: string) => {
  router.push(`/animals/${id}`)
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-blue-900 mb-6">Panel Principal</h1>

    <!-- Resumen de Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Ganado</h3>
        <p class="text-2xl font-bold text-blue-600">{{ cattleCount }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Caballos</h3>
        <p class="text-2xl font-bold text-blue-600">{{ horseCount }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Balance Total</h3>
        <p class="text-2xl font-bold" :class="financialSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'">
          ${{ financialSummary.balance.toLocaleString('es-CO') }}
        </p>
        <div class="mt-2 text-sm text-gray-500">
          <div>Inversión: ${{ financialSummary.totalInvestment.toLocaleString('es-CO') }}</div>
          <div>Ventas: ${{ financialSummary.totalSales.toLocaleString('es-CO') }}</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Próximas Vacunaciones</h3>
        <p class="text-2xl font-bold text-blue-600">{{ upcomingVaccinations.length }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Gráfico de Distribución -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold text-blue-900 mb-4">Distribución por Edad y Sexo</h2>
        <div class="h-80">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Vacunaciones Próximas -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold text-blue-900 mb-4">Próximas Vacunaciones</h2>
        <div class="space-y-4">
          <div v-for="vaccination in upcomingVaccinations" :key="vaccination.id" 
               class="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 class="font-medium text-blue-900">{{ vaccination.name }}</h4>
              <p class="text-sm text-blue-600">{{ vaccination.species === 'all' ? 'Todas' : vaccination.species }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Fecha Prevista</p>
              <p class="font-medium">{{ format(new Date(vaccination.nextDueDate), 'dd/MM/yyyy') }}</p>
            </div>
          </div>
          <div v-if="upcomingVaccinations.length === 0" class="text-center text-gray-500">
            No hay vacunaciones programadas próximamente
          </div>
        </div>
      </div>
    </div>

    <!-- Animales Recientes -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold text-blue-900 mb-4">Ganado Reciente</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="animal in recentAnimals" :key="animal.id" 
             @click="goToAnimalDetail(animal.id)"
             class="bg-blue-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow">
          <div class="flex items-center space-x-4">
            <img :src="animal.imageUrl" alt="Animal" class="w-16 h-16 rounded-full object-cover" />
            <div>
              <h4 class="font-medium text-blue-900">{{ animal.name }}</h4>
              <p class="text-sm text-blue-600">{{ animal.tagNumber }}</p>
              <p class="text-sm text-gray-600">{{ animalStore.calculateAge(animal.birthDate) }}</p>
            </div>
          </div>
        </div>
        <div v-if="recentAnimals.length === 0" class="text-center text-gray-500 col-span-3">
          No hay animales registrados
        </div>
      </div>
    </div>
  </div>
</template>