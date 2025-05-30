<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { format, parseISO, differenceInDays, addDays } from 'date-fns'

const animalStore = useAnimalStore()

const newVaccine = ref({
  name: '',
  description: '',
  lastApplied: new Date().toISOString().split('T')[0],
  nextDueDate: '',
  species: 'all'
})

const speciesOptions = [
  { value: 'all', label: 'Todas las especies' },
  { value: 'Ganado', label: 'Ganado' },
  { value: 'Caballos', label: 'Caballos' }
]

const addVaccine = () => {
  if (!newVaccine.value.name || !newVaccine.value.lastApplied || !newVaccine.value.nextDueDate) return

  animalStore.addVaccinationRecord({
    id: Date.now().toString(),
    ...newVaccine.value
  })

  // Reset form
  newVaccine.value = {
    name: '',
    description: '',
    lastApplied: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    species: 'all'
  }
}

const upcomingVaccinations = computed(() => {
  return animalStore.vaccinationRecords
    .filter(record => {
      const daysUntilDue = differenceInDays(parseISO(record.nextDueDate), new Date())
      return daysUntilDue >= 0
    })
    .sort((a, b) => parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime())
})

const overdueVaccinations = computed(() => {
  return animalStore.vaccinationRecords
    .filter(record => {
      const daysUntilDue = differenceInDays(parseISO(record.nextDueDate), new Date())
      return daysUntilDue < 0
    })
    .sort((a, b) => parseISO(b.nextDueDate).getTime() - parseISO(a.nextDueDate).getTime())
})

const updateVaccination = (record: any) => {
  animalStore.updateVaccinationRecord(record.id, {
    ...record,
    lastApplied: new Date().toISOString().split('T')[0],
    nextDueDate: addDays(new Date(), 180).toISOString().split('T')[0] // Por defecto 6 meses
  })
}

const deleteVaccination = (id: string) => {
  if (confirm('¿Estás seguro de que deseas eliminar este registro de vacunación?')) {
    animalStore.deleteVaccinationRecord(id)
  }
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-900">Calendario de Vacunaciones</h1>
    </div>

    <!-- Formulario para nueva vacuna -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-blue-900 mb-4">Registrar Nueva Vacuna</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nombre de la Vacuna</label>
          <input
            v-model="newVaccine.name"
            type="text"
            required
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Última Aplicación</label>
          <input
            v-model="newVaccine.lastApplied"
            type="date"
            required
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Próxima Aplicación</label>
          <input
            v-model="newVaccine.nextDueDate"
            type="date"
            required
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Especie</label>
          <select
            v-model="newVaccine.species"
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="option in speciesOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="md:col-span-3">
          <label class="block text-sm font-medium text-gray-700">Descripción (opcional)</label>
          <textarea
            v-model="newVaccine.description"
            rows="2"
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button
          @click="addVaccine"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Agregar Vacuna
        </button>
      </div>
    </div>

    <!-- Vacunaciones Vencidas -->
    <div v-if="overdueVaccinations.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-red-600 mb-4">Vacunaciones Vencidas</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Vacuna</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Especie</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Última Aplicación</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Fecha Prevista</th>
              <th class="px-6 py-3 bg-gray-50"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in overdueVaccinations" :key="record.id" class="hover:bg-red-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ record.name }}</div>
                <div v-if="record.description" class="text-sm text-gray-500">{{ record.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ record.species === 'all' ? 'Todas' : record.species }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ format(parseISO(record.lastApplied), 'dd/MM/yyyy') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-red-600 font-medium">
                  {{ format(parseISO(record.nextDueDate), 'dd/MM/yyyy') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="updateVaccination(record)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Aplicada
                </button>
                <button
                  @click="deleteVaccination(record.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Próximas Vacunaciones -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold text-blue-900 mb-4">Próximas Vacunaciones</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Vacuna</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Especie</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Última Aplicación</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Fecha Prevista</th>
              <th class="px-6 py-3 bg-gray-50"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in upcomingVaccinations" :key="record.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ record.name }}</div>
                <div v-if="record.description" class="text-sm text-gray-500">{{ record.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ record.species === 'all' ? 'Todas' : record.species }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ format(parseISO(record.lastApplied), 'dd/MM/yyyy') }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-green-600 font-medium">
                  {{ format(parseISO(record.nextDueDate), 'dd/MM/yyyy') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="updateVaccination(record)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Aplicada
                </button>
                <button
                  @click="deleteVaccination(record.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>