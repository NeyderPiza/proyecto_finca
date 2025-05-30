<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { useRouter, useRoute } from 'vue-router'

const animalStore = useAnimalStore()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const selectedSpecies = ref('')
const selectedStatus = ref('')

// Initialize search from URL if present
if (route.query.search) {
  searchQuery.value = route.query.search as string
}

const speciesOptions = computed(() => {
  const species = new Set(animalStore.animals.map(animal => animal.species))
  return Array.from(species)
})

const filteredAnimals = computed(() => {
  return animalStore.animals.filter(animal => {
    const matchesSearch = searchQuery.value
      ? animal.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        animal.tagNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
      : true
    
    const matchesSpecies = selectedSpecies.value
      ? animal.species === selectedSpecies.value
      : true
    
    const matchesStatus = selectedStatus.value
      ? animal.status === selectedStatus.value
      : true
    
    return matchesSearch && matchesSpecies && matchesStatus
  })
})

const goToAnimalDetail = (id: string) => {
  router.push(`/animals/${id}`)
}

const addNewAnimal = () => {
  router.push('/animals/new')
}

// Update the URL when search changes
watch(searchQuery, (newValue) => {
  router.replace({ 
    query: { 
      ...route.query,
      search: newValue || undefined 
    }
  })
})
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-blue-900">Lista de Animales</h1>
      <button
        @click="addNewAnimal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="pi pi-plus mr-2"></i>
        Añadir Animal
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o número de etiqueta..."
            class="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Especie</label>
          <select
            v-model="selectedSpecies"
            class="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las especies</option>
            <option v-for="species in speciesOptions" :key="species" :value="species">
              {{ species }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="selectedStatus"
            class="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="sold">Vendido</option>
            <option value="deceased">Fallecido</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número de Etiqueta
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Especie
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Nacimiento
              </th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 bg-gray-50"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="animal in filteredAnimals" :key="animal.id" class="hover:bg-blue-50">
              <td class="px-6 py-4 whitespace-nowrap text-blue-600">{{ animal.tagNumber }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ animal.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ animal.species }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ new Date(animal.birthDate).toLocaleDateString() }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
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
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button
                  @click="goToAnimalDetail(animal.id)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  <i class="pi pi-eye"></i>
                  Ver Detalles
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>