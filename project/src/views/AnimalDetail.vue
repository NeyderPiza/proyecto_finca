<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'

const props = defineProps<{
  id: string
}>()

const animalStore = useAnimalStore()
const router = useRouter()

// Estado local
const activeTab = ref('info')
const showSaleModal = ref(false)
const showDeceasedModal = ref(false)

// Getters computados
const animal = computed(() => animalStore.getAnimalById(props.id))
const age = computed(() => animal.value ? animalStore.calculateAge(animal.value.birthDate) : '')

// Formularios
const saleForm = ref({
  date: new Date().toISOString().split('T')[0],
  price: 0,
  buyer: '',
  notes: ''
})

const deceasedForm = ref({
  date: new Date().toISOString().split('T')[0],
  cause: '',
  notes: ''
})

// Funciones
const setTab = (tab: string) => {
  activeTab.value = tab
}

const handleSale = () => {
  if (animal.value && confirm('¿Estás seguro de registrar la venta de este animal?')) {
    animalStore.updateAnimal(props.id, {
      status: 'sold',
      saleInfo: {
        date: saleForm.value.date,
        price: saleForm.value.price,
        buyer: saleForm.value.buyer,
        notes: saleForm.value.notes
      }
    })
    showSaleModal.value = false
    router.push('/animals')
  }
}

const handleDeceased = () => {
  if (animal.value && confirm('¿Estás seguro de registrar el fallecimiento de este animal?')) {
    animalStore.updateAnimal(props.id, {
      status: 'deceased',
      deceasedInfo: {
        date: deceasedForm.value.date,
        cause: deceasedForm.value.cause,
        notes: deceasedForm.value.notes
      }
    })
    showDeceasedModal.value = false
    router.push('/animals')
  }
}

const editAnimal = () => {
  router.push(`/animals/${props.id}/edit`)
}

const addVaccination = () => {
  // TODO: Implementar registro de vacunación
  console.log('Agregar vacunación')
}

const addMedicalEvent = () => {
  // TODO: Implementar registro de evento médico
  console.log('Agregar evento médico')
}

// Redireccionar si el animal no existe
if (!animal.value) {
  router.push('/animals')
}
</script>

<template>
  <div v-if="animal" class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-blue-900">
          {{ animal.name }}
          <span class="text-lg font-normal text-gray-600 ml-2">({{ animal.tagNumber }})</span>
        </h1>
        <p class="text-sm text-gray-500 mt-1">{{ animal.farm }}</p>
      </div>

      <div class="space-x-4">
        <button
          v-if="animal.status === 'active'"
          @click="showSaleModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <i class="pi pi-dollar mr-2"></i>
          Registrar Venta
        </button>
        <button
          v-if="animal.status === 'active'"
          @click="showDeceasedModal = true"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <i class="pi pi-exclamation-circle mr-2"></i>
          Registrar Fallecimiento
        </button>
        <button
          @click="editAnimal"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i class="pi pi-pencil mr-2"></i>
          Editar
        </button>
      </div>
    </div>

    <!-- Modal de Venta -->
    <div v-if="showSaleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Registrar Venta</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Fecha de Venta</label>
            <input
              v-model="saleForm.date"
              type="date"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Precio de Venta</label>
            <div class="relative mt-1">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
              <input
                v-model.number="saleForm.price"
                type="number"
                required
                min="0"
                step="1000"
                class="w-full pl-8 px-4 py-2 rounded-lg border border-gray-300"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Comprador</label>
            <input
              v-model="saleForm.buyer"
              type="text"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Notas</label>
            <textarea
              v-model="saleForm.notes"
              rows="3"
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            ></textarea>
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-4">
          <button
            @click="showSaleModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancelar
          </button>
          <button
            @click="handleSale"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Confirmar Venta
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Fallecimiento -->
    <div v-if="showDeceasedModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Registrar Fallecimiento</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              v-model="deceasedForm.date"
              type="date"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Causa</label>
            <input
              v-model="deceasedForm.cause"
              type="text"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Notas Adicionales</label>
            <textarea
              v-model="deceasedForm.notes"
              rows="3"
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            ></textarea>
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-4">
          <button
            @click="showDeceasedModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancelar
          </button>
          <button
            @click="handleDeceased"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Confirmar Fallecimiento
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md">
      <div class="border-b border-gray-200">
        <nav class="flex">
          <button
            @click="setTab('info')"
            :class="{
              'px-6 py-4 text-sm font-medium border-b-2 -mb-px': true,
              'border-blue-600 text-blue-600': activeTab === 'info',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'info'
            }"
          >
            Información General
          </button>
          <button
            @click="setTab('vaccinations')"
            :class="{
              'px-6 py-4 text-sm font-medium border-b-2 -mb-px': true,
              'border-blue-600 text-blue-600': activeTab === 'vaccinations',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'vaccinations'
            }"
          >
            Vacunaciones
          </button>
          <button
            @click="setTab('medical')"
            :class="{
              'px-6 py-4 text-sm font-medium border-b-2 -mb-px': true,
              'border-blue-600 text-blue-600': activeTab === 'medical',
              'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'medical'
            }"
          >
            Historial Médico
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- Info Tab -->
        <div v-if="activeTab === 'info'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Especie</h3>
              <p class="mt-1 text-lg">{{ animal.species }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Raza</h3>
              <p class="mt-1 text-lg">{{ animal.breed || 'No especificada' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Género</h3>
              <p class="mt-1 text-lg">{{ animal.gender === 'female' ? 'Hembra' : 'Macho' }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Estado</h3>
              <p class="mt-1">
                <span :class="{
                  'px-2 py-1 text-sm rounded-full': true,
                  'bg-green-100 text-green-800': animal.status === 'active',
                  'bg-yellow-100 text-yellow-800': animal.status === 'sold',
                  'bg-red-100 text-red-800': animal.status === 'deceased'
                }">
                  {{ 
                    animal.status === 'active' ? 'Activo' :
                    animal.status === 'sold' ? 'Vendido' :
                    'Fallecido'
                  }}
                </span>
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500">Fecha de Nacimiento</h3>
              <p class="mt-1 text-lg">{{ format(new Date(animal.birthDate), 'dd/MM/yyyy') }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Edad</h3>
              <p class="mt-1 text-lg">{{ age }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500">Información de Compra</h3>
              <div v-if="animal.purchaseInfo" class="mt-1">
                <p>Fecha: {{ format(new Date(animal.purchaseInfo.date), 'dd/MM/yyyy') }}</p>
                <p>Precio: ${{ animal.purchaseInfo.price.toLocaleString('es-CO') }}</p>
                <p>Vendedor: {{ animal.purchaseInfo.seller }}</p>
              </div>
              <p v-else class="mt-1 text-gray-500">No hay información de compra</p>
            </div>
            <div v-if="animal.status === 'sold'">
              <h3 class="text-sm font-medium text-gray-500">Información de Venta</h3>
              <div v-if="animal.saleInfo" class="mt-1">
                <p>Fecha: {{ format(new Date(animal.saleInfo.date), 'dd/MM/yyyy') }}</p>
                <p>Precio: ${{ animal.saleInfo.price.toLocaleString('es-CO') }}</p>
                <p>Comprador: {{ animal.saleInfo.buyer }}</p>
                <p v-if="animal.saleInfo.notes">Notas: {{ animal.saleInfo.notes }}</p>
              </div>
            </div>
            <div v-if="animal.status === 'deceased'">
              <h3 class="text-sm font-medium text-gray-500">Información de Fallecimiento</h3>
              <div v-if="animal.deceasedInfo" class="mt-1">
                <p>Fecha: {{ format(new Date(animal.deceasedInfo.date), 'dd/MM/yyyy') }}</p>
                <p>Causa: {{ animal.deceasedInfo.cause }}</p>
                <p v-if="animal.deceasedInfo.notes">Notas: {{ animal.deceasedInfo.notes }}</p>
              </div>
            </div>
          </div>

          <div class="md:col-span-2">
            <h3 class="text-sm font-medium text-gray-500">Notas</h3>
            <p class="mt-1 text-lg">{{ animal.notes || 'Sin notas adicionales' }}</p>
          </div>
        </div>

        <!-- Vaccinations Tab -->
        <div v-if="activeTab === 'vaccinations'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Registro de Vacunaciones</h3>
            <button
              @click="addVaccination"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i class="pi pi-plus mr-2"></i>
              Nueva Vacunación
            </button>
          </div>

          <div v-if="animal.species === 'Ganado'" class="space-y-4">
            <div v-for="vaccination in animalStore.vaccinationRecords.filter(v => v.species === 'Ganado' || v.species === 'all')"
                 :key="vaccination.id"
                 class="bg-blue-50 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-medium text-blue-900">{{ vaccination.name }}</h4>
                  <p class="text-sm text-blue-600">{{ vaccination.description }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-600">Última aplicación:</p>
                  <p class="font-medium">{{ format(new Date(vaccination.lastApplied), 'dd/MM/yyyy') }}</p>
                  <p class="text-sm text-gray-600 mt-2">Próxima dosis:</p>
                  <p class="font-medium">{{ format(new Date(vaccination.nextDueDate), 'dd/MM/yyyy') }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="animal.species === 'Caballos'" class="space-y-4">
            <div v-for="vaccination in animalStore.vaccinationRecords.filter(v => v.species === 'Caballos' || v.species === 'all')"
                 :key="vaccination.id"
                 class="bg-blue-50 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-medium text-blue-900">{{ vaccination.name }}</h4>
                  <p class="text-sm text-blue-600">{{ vaccination.description }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-600">Última aplicación:</p>
                  <p class="font-medium">{{ format(new Date(vaccination.lastApplied), 'dd/MM/yyyy') }}</p>
                  <p class="text-sm text-gray-600 mt-2">Próxima dosis:</p>
                  <p class="font-medium">{{ format(new Date(vaccination.nextDueDate), 'dd/MM/yyyy') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Medical Tab -->
        <div v-if="activeTab === 'medical'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Historial Médico</h3>
            <button
              @click="addMedicalEvent"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i class="pi pi-plus mr-2"></i>
              Nuevo Evento Médico
            </button>
          </div>
          <p class="text-gray-500 text-center">No hay registros médicos disponibles</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="p-6">
    <p class="text-center text-gray-500">Animal no encontrado</p>
  </div>
</template>