<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'

const animalStore = useAnimalStore()
const router = useRouter()

const activeTab = ref('purchases')
const financialSummary = computed(() => animalStore.financialSummary)

const formatCurrency = (value: number) => {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const goToAnimalDetail = (id: string) => {
  router.push(`/animals/${id}`)
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-900">Finanzas</h1>
      <p class="text-gray-600">Control de inversiones y ventas de animales</p>
    </div>

    <!-- Resumen Financiero -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Balance General</h3>
        <p class="text-2xl font-bold" :class="financialSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ formatCurrency(financialSummary.balance) }}
        </p>
        <div class="mt-2 text-sm text-gray-500">
          <div>Inversión: {{ formatCurrency(financialSummary.totalInvestment) }}</div>
          <div>Ventas: {{ formatCurrency(financialSummary.totalSales) }}</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Ganado</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Comprados</p>
            <p class="text-xl font-semibold text-blue-600">              {{ financialSummary.bySpecies.ganado.purchases.count }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatCurrency(financialSummary.bySpecies.ganado.purchases.total) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Vendidos</p>
            <p class="text-xl font-semibold text-green-600">
              {{ financialSummary.bySpecies.ganado.sales.count }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatCurrency(financialSummary.bySpecies.ganado.sales.total) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Caballos</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Comprados</p>
            <p class="text-xl font-semibold text-blue-600">
              {{ financialSummary.bySpecies.caballos.purchases.count }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatCurrency(financialSummary.bySpecies.caballos.purchases.total) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Vendidos</p>
            <p class="text-xl font-semibold text-green-600">
              {{ financialSummary.bySpecies.caballos.sales.count }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatCurrency(financialSummary.bySpecies.caballos.sales.total) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs de Compras y Ventas -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="border-b border-gray-200">
        <nav class="flex">
          <button
            @click="activeTab = 'purchases'"
            :class="{
              'px-6 py-4 text-sm font-medium border-b-2 -mb-px': true,
              'border-blue-600 text-blue-600': activeTab === 'purchases',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'purchases'
            }"
          >
            Compras
          </button>
          <button
            @click="activeTab = 'sales'"
            :class="{
              'px-6 py-4 text-sm font-medium border-b-2 -mb-px': true,
              'border-blue-600 text-blue-600': activeTab === 'sales',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'sales'
            }"
          >
            Ventas
          </button>
        </nav>
      </div>

      <!-- Tabla de Compras -->
      <div v-if="activeTab === 'purchases'" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Especie</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="animal in animalStore.allAnimals.filter(a => a.purchaseInfo)"
                :key="animal.id"
                @click="goToAnimalDetail(animal.id)"
                class="hover:bg-gray-50 cursor-pointer">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ animal.name }}</div>
                    <div class="text-sm text-gray-500">#{{ animal.tagNumber }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ animal.species }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ format(new Date(animal.purchaseInfo!.date), 'dd/MM/yyyy') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ formatCurrency(animal.purchaseInfo!.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ animal.purchaseInfo!.seller }}
              </td>
            </tr>
            <tr v-if="!animalStore.allAnimals.some(a => a.purchaseInfo)" class="hover:bg-gray-50">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No hay registros de compras
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tabla de Ventas -->
      <div v-if="activeTab === 'sales'" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Animal</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Especie</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Comprador</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="animal in animalStore.allAnimals.filter(a => a.saleInfo)"
                :key="animal.id"
                @click="goToAnimalDetail(animal.id)"
                class="hover:bg-gray-50 cursor-pointer">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ animal.name }}</div>
                    <div class="text-sm text-gray-500">#{{ animal.tagNumber }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ animal.species }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ format(new Date(animal.saleInfo!.date), 'dd/MM/yyyy') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ formatCurrency(animal.saleInfo!.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ animal.saleInfo!.buyer }}
              </td>
            </tr>
            <tr v-if="!animalStore.allAnimals.some(a => a.saleInfo)" class="hover:bg-gray-50">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No hay registros de ventas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
