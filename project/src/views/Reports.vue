<script setup lang="ts">
import { ref } from 'vue'
import { useAnimalStore } from '../stores/animalStore'

const animalStore = useAnimalStore()

const generateReport = () => {
  // Placeholder for report generation
  alert('La generación de informes se implementará aquí')
}
</script>

<template>
  <div class="animate-fade-in p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-blue-900">Informes</h1>
      <p class="text-gray-600">Genera informes sobre los animales de tu granja</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-all">
        <div class="mb-4 text-blue-500">
          <i class="pi pi-list text-3xl"></i>
        </div>
        <h2 class="text-lg font-semibold mb-2 text-blue-900">Inventario de Animales</h2>
        <p class="text-gray-600 mb-4">
          Genera un inventario completo de todos los animales en tu granja con detalles incluyendo especie, edad y estado.
        </p>
        <button @click="generateReport" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Generar Informe
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-all">
        <div class="mb-4 text-blue-500">
          <i class="pi pi-calendar text-3xl"></i>
        </div>
        <h2 class="text-lg font-semibold mb-2 text-blue-900">Calendario de Vacunaciones</h2>
        <p class="text-gray-600 mb-4">
          Exporta un calendario completo de vacunaciones para los próximos 3 meses, incluyendo fechas y detalles de los animales.
        </p>
        <button @click="generateReport" class="w-full bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors">
          Generar Informe
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-all">
        <div class="mb-4 text-blue-500">
          <i class="pi pi-heart text-3xl"></i>
        </div>
        <h2 class="text-lg font-semibold mb-2 text-blue-900">Registros de Salud</h2>
        <p class="text-gray-600 mb-4">
          Compila registros de salud para todos los animales o individuos específicos, incluyendo eventos médicos y tratamientos.
        </p>
        <button @click="generateReport" class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Generar Informe
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-all">
        <div class="mb-4 text-blue-500">
          <i class="pi pi-chart-line text-3xl"></i>
        </div>
        <h2 class="text-lg font-semibold mb-2 text-blue-900">Seguimiento de Crecimiento</h2>
        <p class="text-gray-600 mb-4">
          Rastrea patrones y estadísticas de crecimiento animal a lo largo del tiempo, organizado por especie o animales individuales.
        </p>
        <button @click="generateReport" class="w-full bg-success-500 text-white hover:bg-success-600 px-4 py-2 rounded-lg transition-colors">
          Generar Informe
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-all">
        <div class="mb-4 text-blue-500">
          <i class="pi pi-users text-3xl"></i>
        </div>
        <h2 class="text-lg font-semibold mb-2 text-blue-900">Historial de Reproducción</h2>
        <p class="text-gray-600 mb-4">
          Genera informes detallados del historial de reproducción, incluyendo seguimiento de crías e información sobre linajes.
        </p>
        <button @click="generateReport" class="w-full bg-warning-500 text-white hover:bg-warning-600 px-4 py-2 rounded-lg transition-colors">
          Generar Informe
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-all">
        <div class="mb-4 text-blue-500">
          <i class="pi pi-cog text-3xl"></i>
        </div>
        <h2 class="text-lg font-semibold mb-2 text-blue-900">Informe Personalizado</h2>
        <p class="text-gray-600 mb-4">
          Elabora un informe personalizado con campos de datos y parámetros específicos según tus necesidades.
        </p>
        <button @click="generateReport" class="w-full bg-gray-700 text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
          Crear Informe Personalizado
        </button>
      </div>
    </div>
  </div>
</template>