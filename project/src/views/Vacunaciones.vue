<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAnimalStore } from '../stores/animalStore'
import { format, parseISO, differenceInDays, addDays, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import type { VaccinationRecord } from '../types'

const animalStore = useAnimalStore()
const showEditForm = ref(false)
const showExpenseForm = ref(false)

const initialVaccineForm = {
  name: '',
  description: '',
  lastApplied: new Date().toISOString().split('T')[0],
  nextDueDate: addMonths(new Date(), 6).toISOString().split('T')[0],
  species: 'all',
  cost: 0,
  notes: ''
}

const vaccineForm = ref({ ...initialVaccineForm })
const editingVaccineId = ref('')

const speciesOptions = [
  { value: 'all', label: 'Todas las especies' },
  { value: 'Ganado', label: 'Ganado' },
  { value: 'Caballos', label: 'Caballos' }
]

const resetForm = () => {
  vaccineForm.value = { ...initialVaccineForm }
  editingVaccineId.value = ''
  showEditForm.value = false
}

const addVaccine = () => {
  if (!vaccineForm.value.name || !vaccineForm.value.lastApplied || !vaccineForm.value.nextDueDate || !vaccineForm.value.species) {
    alert('Por favor complete todos los campos requeridos')
    return
  }

  try {
    if (editingVaccineId.value) {
      animalStore.updateVaccinationRecord(editingVaccineId.value, vaccineForm.value)
    } else {
      const vaccineData = {
        name: vaccineForm.value.name,
        description: vaccineForm.value.description,
        lastApplied: vaccineForm.value.lastApplied,
        nextDueDate: vaccineForm.value.nextDueDate,
        species: vaccineForm.value.species,
        cost: vaccineForm.value.cost,
        notes: vaccineForm.value.notes
      }
      animalStore.addVaccinationRecord(vaccineData)
    }
    resetForm()
  } catch (error) {
    console.error('Error al guardar la vacuna:', error)
    alert('Ocurrió un error al guardar la vacuna')
  }
}

const editVaccine = (vaccine: VaccinationRecord) => {
  vaccineForm.value = { ...vaccine }
  editingVaccineId.value = vaccine.id
  showEditForm.value = true
}

const calculateNextDueDate = () => {
  if (vaccineForm.value.lastApplied) {
    const lastApplied = parseISO(vaccineForm.value.lastApplied)
    vaccineForm.value.nextDueDate = addMonths(lastApplied, 6).toISOString().split('T')[0]
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

const updateVaccination = (record: VaccinationRecord) => {
  if (!confirm('¿Desea marcar esta vacuna como aplicada hoy?')) return

  const updatedRecord = {
    ...record,
    lastApplied: new Date().toISOString().split('T')[0],
    nextDueDate: addMonths(new Date(), 6).toISOString().split('T')[0]
  }
  animalStore.updateVaccinationRecord(record.id, updatedRecord)
}

const deleteVaccination = (id: string) => {
  if (confirm('¿Está seguro de que desea eliminar este registro de vacunación?')) {
    animalStore.deleteVaccinationRecord(id)
  }
}

const formatDate = (date: string) => {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: es })
}

const getDaysUntilDue = (dueDate: string) => {
  const days = differenceInDays(parseISO(dueDate), new Date())
  return days
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-900">Calendario de Vacunaciones</h1>
    </div>

    <!-- Formulario para agregar/editar vacuna -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-blue-900 mb-4">
        {{ editingVaccineId ? 'Editar Vacuna' : 'Registrar Nueva Vacuna' }}
      </h2>
      <form @submit.prevent="addVaccine" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Campos existentes -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Nombre de la Vacuna</label>
          <input
            v-model="vaccineForm.name"
            type="text"
            required
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Última Aplicación</label>
          <input
            v-model="vaccineForm.lastApplied"
            type="date"
            required
            @change="calculateNextDueDate"
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Próxima Aplicación</label>
          <input
            v-model="vaccineForm.nextDueDate"
            type="date"
            required
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Especie</label>
          <select
            v-model="vaccineForm.species"
            required
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option v-for="option in speciesOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Costo</label>
          <input
            v-model="vaccineForm.cost"
            type="number"
            min="0"
            step="1000"
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="md:col-span-3">
          <label class="block text-sm font-medium text-gray-700">Descripción y notas</label>
          <textarea
            v-model="vaccineForm.description"
            rows="2"
            class="mt-1 w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div class="md:col-span-3 flex justify-end gap-4">
          <button
            type="button"
            v-if="showEditForm"
            @click="resetForm"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{ editingVaccineId ? 'Guardar Cambios' : 'Agregar Vacuna' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Vacunaciones Vencidas -->
    <div v-if="overdueVaccinations.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-red-600 mb-4">
        Vacunaciones Vencidas ({{ overdueVaccinations.length }})
      </h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-2 text-left">Vacuna</th>
              <th class="px-4 py-2 text-left">Especie</th>
              <th class="px-4 py-2 text-left">Última Aplicación</th>
              <th class="px-4 py-2 text-left">Fecha Vencimiento</th>
              <th class="px-4 py-2 text-right">Costo</th>
              <th class="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in overdueVaccinations" :key="record.id" class="border-t">
              <td class="px-4 py-2">
                <div class="font-medium">{{ record.name }}</div>
                <div class="text-sm text-gray-500">{{ record.description }}</div>
              </td>
              <td class="px-4 py-2">{{ record.species }}</td>
              <td class="px-4 py-2">{{ formatDate(record.lastApplied) }}</td>
              <td class="px-4 py-2">
                <span class="text-red-600">{{ formatDate(record.nextDueDate) }}</span>
                <br>
                <span class="text-sm text-red-500">
                  ({{ Math.abs(getDaysUntilDue(record.nextDueDate)) }} días de retraso)
                </span>
              </td>
              <td class="px-4 py-2 text-right">
                {{ record.cost ? `$${record.cost.toLocaleString()}` : 'N/A' }}
              </td>
              <td class="px-4 py-2 text-center">
                <button
                  @click="updateVaccination(record)"
                  class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                >
                  Aplicar
                </button>
                <button
                  @click="editVaccine(record)"
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                >
                  Editar
                </button>
                <button
                  @click="deleteVaccination(record.id)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
      <h2 class="text-lg font-semibold text-blue-900 mb-4">
        Próximas Vacunaciones ({{ upcomingVaccinations.length }})
      </h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-2 text-left">Vacuna</th>
              <th class="px-4 py-2 text-left">Especie</th>
              <th class="px-4 py-2 text-left">Última Aplicación</th>
              <th class="px-4 py-2 text-left">Próxima Aplicación</th>
              <th class="px-4 py-2 text-right">Costo</th>
              <th class="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in upcomingVaccinations" :key="record.id" class="border-t">
              <td class="px-4 py-2">
                <div class="font-medium">{{ record.name }}</div>
                <div class="text-sm text-gray-500">{{ record.description }}</div>
              </td>
              <td class="px-4 py-2">{{ record.species }}</td>
              <td class="px-4 py-2">{{ formatDate(record.lastApplied) }}</td>
              <td class="px-4 py-2">
                <span>{{ formatDate(record.nextDueDate) }}</span>
                <br>
                <span class="text-sm text-gray-500">
                  (en {{ getDaysUntilDue(record.nextDueDate) }} días)
                </span>
              </td>
              <td class="px-4 py-2 text-right">
                {{ record.cost ? `$${record.cost.toLocaleString()}` : 'N/A' }}
              </td>
              <td class="px-4 py-2 text-center">
                <button
                  @click="updateVaccination(record)"
                  class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                >
                  Aplicar
                </button>
                <button
                  @click="editVaccine(record)"
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                >
                  Editar
                </button>
                <button
                  @click="deleteVaccination(record.id)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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