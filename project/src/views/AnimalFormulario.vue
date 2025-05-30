<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { useRouter, useRoute } from 'vue-router'
import type { Animal } from '../types'
import { format, differenceInYears, differenceInMonths, parse } from 'date-fns'

const props = defineProps<{
  id?: string
}>()

const animalStore = useAnimalStore()
const router = useRouter()
const route = useRoute()

const isEditMode = computed(() => !!props.id)
const pageTitle = computed(() => isEditMode.value ? 'Editar Animal' : 'Añadir Nuevo Animal')
const buttonText = computed(() => isEditMode.value ? 'Actualizar Animal' : 'Añadir Animal')

const isPurchased = ref(false)

// Initialize with empty animal or existing animal data
const formData = ref<Omit<Animal, 'id'>>({
  name: '',
  species: 'Ganado',
  breed: '',
  gender: 'female',
  birthDate: '',
  tagNumber: '',
  status: 'active',
  notes: '',
  farm: '',
  parent: {
    motherId: '',
    fatherId: ''
  },
  purchaseInfo: undefined,
  imageUrl: ''
}) as { value: Omit<Animal, 'id'> & { purchaseInfo?: { date: string; price: number; seller: string } } }

// Initialize purchaseInfo cuando se marca como comprado
watch(isPurchased, (newValue) => {
  if (newValue && !formData.value.purchaseInfo) {
    formData.value.purchaseInfo = {
      date: new Date().toISOString().split('T')[0],
      price: 0,
      seller: ''
    }
  } else if (!newValue) {
    formData.value.purchaseInfo = undefined
  }
})

// Lista de especies permitidas
const speciesOptions = [
  { value: 'Ganado', label: 'Ganado' },
  { value: 'Caballos', label: 'Caballos' }
]

const calculatedAge = computed(() => {
  if (!formData.value.birthDate) return ''
  const birthDate = new Date(formData.value.birthDate)
  const now = new Date()
  const years = differenceInYears(now, birthDate)
  const months = differenceInMonths(now, birthDate) % 12
  
  if (years > 0) {
    return months > 0 ? `${years} años y ${months} meses` : `${years} años`
  }
  return `${months} meses`
})

// Get all active animals for parent selection
const availableMothers = computed(() => 
  animalStore.animals.filter(animal => 
    animal.gender === 'female' && 
    animal.status === 'active' &&
    (!isEditMode.value || animal.id !== props.id)
  )
)

const availableFathers = computed(() => 
  animalStore.animals.filter(animal => 
    animal.gender === 'male' && 
    animal.status === 'active' &&
    (!isEditMode.value || animal.id !== props.id)
  )
)

// Load existing animal data if in edit mode
onMounted(() => {
  if (isEditMode.value && props.id) {
    const animal = animalStore.getAnimalById(props.id)
    if (animal) {
      formData.value = { ...animal }
    } else {
      router.push('/animals')
    }
  }
})

// Form validation
const errors = ref<Record<string, string>>({})

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Name is required'
  }
  
  if (!formData.value.species) {
    errors.value.species = 'Species is required'
  }
  
  if (!formData.value.tagNumber.trim()) {
    errors.value.tagNumber = 'Tag number is required'
  }
  
  if (!formData.value.birthDate) {
    errors.value.birthDate = 'Birth date is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const submitForm = () => {
  if (!validateForm()) return
  
  if (isEditMode.value && props.id) {
    animalStore.updateAnimal(props.id, formData.value)
    router.push(`/animals/${props.id}`)
  } else {
    const newId = animalStore.addAnimal(formData.value)
    router.push(`/animals/${newId}`)
  }
}

const cancelForm = () => {
  if (isEditMode.value && props.id) {
    router.push(`/animals/${props.id}`)
  } else {
    router.push('/animals')
  }
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-900">{{ pageTitle }}</h1>
    </div>

    <form @submit.prevent="submitForm" class="max-w-4xl">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Información básica -->
          <div>
            <h2 class="text-lg font-semibold text-blue-900 mb-4">Información Básica</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Especie</label>
                <select
                  v-model="formData.species"
                  required
                  class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option v-for="option in speciesOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Número de Etiqueta</label>
                <input
                  v-model="formData.tagNumber"
                  type="text"
                  required
                  class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Raza</label>
                <input
                  v-model="formData.breed"
                  type="text"
                  required
                  class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Género</label>
                <select
                  v-model="formData.gender"
                  required
                  class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="female">Hembra</option>
                  <option value="male">Macho</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                  v-model="formData.birthDate"
                  type="date"
                  required
                  class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-if="calculatedAge" class="mt-1 text-sm text-blue-600">
                  Edad: {{ calculatedAge }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Finca</label>
                <input
                  v-model="formData.farm"
                  type="text"
                  required
                  class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Información adicional -->
          <div>
            <h2 class="text-lg font-semibold text-blue-900 mb-4">Información Adicional</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Madre</label>
                <select
                  v-model="formData.parent.motherId"
                  class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sin madre registrada</option>
                  <option v-for="mother in availableMothers" :key="mother.id" :value="mother.id">
                    {{ mother.name }} ({{ mother.tagNumber }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Padre</label>
                <select
                  v-model="formData.parent.fatherId"
                  class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sin padre registrado</option>
                  <option v-for="father in availableFathers" :key="father.id" :value="father.id">
                    {{ father.name }} ({{ father.tagNumber }})
                  </option>
                </select>
              </div>

              <div class="pt-4">
                <label class="flex items-center">
                  <input
                    v-model="isPurchased"
                    type="checkbox"
                    class="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span class="ml-2">Animal comprado</span>
                </label>
              </div>

              <div v-if="isPurchased" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Fecha de Compra</label>
                  <input
                    v-model="formData.purchaseInfo.date"
                    type="date"
                    required
                    class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Precio de Compra</label>
                  <div class="relative mt-1">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                    <input
                      v-model.number="formData.purchaseInfo.price"
                      type="number"
                      required
                      min="0"
                      step="1000"
                      class="w-full pl-8 px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Vendedor</label>
                  <input
                    v-model="formData.purchaseInfo.seller"
                    type="text"
                    required
                    class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Notas Adicionales</label>
                <textarea
                  v-model="formData.notes"
                  rows="3"
                  class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            @click="cancelForm"
            class="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{ buttonText }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>