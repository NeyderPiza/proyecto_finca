<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, addDays, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'
import type { MilkProduction, MilkExpense } from '../types'

const animalStore = useAnimalStore()
const showAddForm = ref(false)
const showExpenseForm = ref(false)
const selectedProductionId = ref('')
const isEditing = ref(false)
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)

const formData = ref<MilkProduction>({
  id: '',
  date: new Date().toISOString().split('T')[0],
  farm: '',
  liters: 0,
  pricePerLiter: 2000,
  expenses: []
})

const expenseForm = ref<Omit<MilkExpense, 'id'>>({
  description: '',
  amount: 0,
  category: 'supplement',
  date: new Date().toISOString().split('T')[0]
})

// Datos actuales
const currentMonthData = computed(() => {
  const monthStart = startOfMonth(new Date(selectedYear.value, selectedMonth.value - 1))
  const monthEnd = endOfMonth(monthStart)

  return animalStore.milkProductions.filter((prod: MilkProduction) => 
    isWithinInterval(parseISO(prod.date), { start: monthStart, end: monthEnd })
  )
})

// Datos históricos
const historicalMonthData = computed(() => {
  if (selectedYear.value === new Date().getFullYear()) {
    return null
  }
  return animalStore.getHistoricalMonthlyData(selectedYear.value, selectedMonth.value)
})

// Lista de registros ordenados
const sortedProductions = computed(() => {
  if (selectedYear.value === new Date().getFullYear()) {
    return [...currentMonthData.value].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }
  return []
})

// Resumen mensual
const monthlyStats = computed(() => {
  const stats = {
    month: format(new Date(selectedYear.value, selectedMonth.value - 1), 'MMMM yyyy', { locale: es }),
    totalLiters: 0,
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  }

  if (selectedYear.value === new Date().getFullYear()) {
    const monthProductions = currentMonthData.value
    stats.totalLiters = monthProductions.reduce((sum, p) => sum + p.liters, 0)
    stats.totalIncome = monthProductions.reduce((sum, p) => sum + (p.liters * p.pricePerLiter), 0)
    stats.totalExpenses = monthProductions.reduce((sum, p) => 
      sum + p.expenses.reduce((expSum, e) => expSum + e.amount, 0), 0
    )
  } else if (historicalMonthData.value) {
    const historical = historicalMonthData.value
    stats.totalLiters = historical.liters
    stats.totalIncome = historical.income
    stats.totalExpenses = historical.expenses
  }

  stats.balance = stats.totalIncome - stats.totalExpenses
  return stats
})

const availableYears = computed(() => {
  const years = animalStore.historicalMilkData.map(d => d.year)
  years.push(new Date().getFullYear())
  return years.sort((a, b) => b - a)
})

const farms = computed(() => animalStore.availableFarms)

// Funciones auxiliares
const formatCurrency = (value: number) => {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
}

const validateDate = (date: string): { valid: boolean; message?: string } => {
  const selectedDate = parseISO(date)
  const now = new Date()

  if (isBefore(now, selectedDate)) {
    return { valid: false, message: 'No se pueden registrar fechas futuras' }
  }

  return { valid: true }
}

const editProduction = (production: MilkProduction) => {
  formData.value = { ...production }
  isEditing.value = true
  showAddForm.value = true
}

const deleteProduction = (id: string) => {
  if (confirm('¿Está seguro de que desea eliminar este registro?')) {
    animalStore.deleteMilkProduction(id)
  }
}

const submitForm = () => {
  const dateValidation = validateDate(formData.value.date)
  if (!dateValidation.valid) {
    alert(dateValidation.message)
    return
  }

  if (isEditing.value) {
    animalStore.updateMilkProduction(formData.value.id, formData.value)
  } else {
    animalStore.addMilkProduction(formData.value)
  }

  formData.value = {
    id: '',
    date: new Date().toISOString().split('T')[0],
    farm: '',
    liters: 0,
    pricePerLiter: 2000,
    expenses: []
  }
  isEditing.value = false
  showAddForm.value = false
}

const submitExpense = () => {
  if (selectedProductionId.value) {
    animalStore.addMilkExpense(selectedProductionId.value, expenseForm.value)
    expenseForm.value = {
      description: '',
      amount: 0,
      category: 'supplement',
      date: new Date().toISOString().split('T')[0]
    }
    showExpenseForm.value = false
    selectedProductionId.value = ''
  }
}
</script>

<template>
  <div class="p-6">
    <!-- Selector de Año y Mes -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-4">
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
      
      <button
        v-if="selectedYear === new Date().getFullYear()"
        @click="showAddForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="pi pi-plus mr-2"></i>
        Registrar Producción
      </button>
    </div>

    <!-- Resumen del Mes -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Total Litros</h3>
        <p class="text-2xl font-bold text-blue-600">{{ monthlyStats.totalLiters.toLocaleString() }} L</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Ingresos</h3>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(monthlyStats.totalIncome) }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Gastos</h3>
        <p class="text-2xl font-bold text-red-600">{{ formatCurrency(monthlyStats.totalExpenses) }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">Balance</h3>
        <p class="text-2xl font-bold" :class="monthlyStats.balance >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ formatCurrency(monthlyStats.balance) }}
        </p>
      </div>
    </div>

    <!-- Lista de Registros -->
    <div class="bg-white rounded-lg shadow-md p-6" v-if="selectedYear === new Date().getFullYear()">
      <h2 class="text-lg font-semibold text-blue-900 mb-4">Registros de {{ monthlyStats.month }}</h2>
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
                Litros
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio/L
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gastos
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th class="px-6 py-3 bg-gray-50"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="prod in sortedProductions" :key="prod.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                {{ format(parseISO(prod.date), 'dd/MM/yyyy') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ prod.farm }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ prod.liters.toLocaleString() }} L</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatCurrency(prod.pricePerLiter) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                {{ formatCurrency(prod.liters * prod.pricePerLiter) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                {{ formatCurrency(prod.expenses.reduce((sum, e) => sum + e.amount, 0)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" 
                  :class="(prod.liters * prod.pricePerLiter - prod.expenses.reduce((sum, e) => sum + e.amount, 0)) >= 0 
                          ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(prod.liters * prod.pricePerLiter - prod.expenses.reduce((sum, e) => sum + e.amount, 0)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button @click="editProduction(prod)" class="text-blue-600 hover:text-blue-900">
                  <i class="pi pi-pencil"></i>
                </button>
                <button @click="deleteProduction(prod.id)" class="text-red-600 hover:text-red-900">
                  <i class="pi pi-trash"></i>
                </button>
                <button 
                  @click="selectedProductionId = prod.id; showExpenseForm = true"
                  class="text-green-600 hover:text-green-900"
                >
                  <i class="pi pi-plus-circle"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Datos Históricos -->
    <div class="bg-white rounded-lg shadow-md p-6" v-else>
      <h2 class="text-lg font-semibold text-blue-900 mb-4">Datos Históricos de {{ monthlyStats.month }}</h2>
      <div v-if="historicalMonthData" class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p class="text-sm text-gray-500">Total Litros</p>
          <p class="text-xl font-medium">{{ historicalMonthData.liters.toLocaleString() }} L</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Ingresos</p>
          <p class="text-xl font-medium text-green-600">{{ formatCurrency(historicalMonthData.income) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Gastos</p>
          <p class="text-xl font-medium text-red-600">{{ formatCurrency(historicalMonthData.expenses) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Balance</p>
          <p class="text-xl font-medium" :class="historicalMonthData.balance >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ formatCurrency(historicalMonthData.balance) }}
          </p>
        </div>
      </div>
      <p v-else class="text-gray-500">No hay datos históricos para este período</p>
    </div>

    <!-- Modal de Registro de Producción -->
    <div v-if="showAddForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? 'Editar' : 'Registrar' }} Producción</h2>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              v-model="formData.date"
              type="date"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Finca</label>
            <select
              v-model="formData.farm"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="">Seleccionar finca</option>
              <option v-for="farm in farms" :key="farm" :value="farm">{{ farm }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Litros Producidos</label>
            <input
              v-model.number="formData.liters"
              type="number"
              required
              min="0"
              step="0.1"
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Precio por Litro</label>
            <div class="relative mt-1">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
              <input
                v-model.number="formData.pricePerLiter"
                type="number"
                required
                min="0"
                class="w-full pl-8 px-4 py-2 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              @click="showAddForm = false"
              class="px-4 py-2 border border-gray-300 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Botón para Agregar Gasto -->
    <div class="fixed bottom-6 right-6">
      <button
        @click="showExpenseForm = true"
        class="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors shadow-lg"
      >
        <i class="pi pi-plus mr-2"></i>
        Registrar Gasto
      </button>
    </div>

    <!-- Modal de Registro de Gasto -->
    <div v-if="showExpenseForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Registrar Gasto</h2>
        <form @submit.prevent="submitExpense" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              v-model="expenseForm.date"
              type="date"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Descripción</label>
            <input
              v-model="expenseForm.description"
              type="text"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              v-model="expenseForm.category"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="supplement">Suplemento</option>
              <option value="medicine">Medicamento</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Monto</label>
            <div class="relative mt-1">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
              <input
                v-model.number="expenseForm.amount"
                type="number"
                required
                min="0"
                class="w-full pl-8 px-4 py-2 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              @click="showExpenseForm = false"
              class="px-4 py-2 border border-gray-300 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
