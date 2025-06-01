<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

const handleSubmit = () => {
  error.value = ''
  if (authStore.login(email.value, password.value)) {
    router.push('/')
  } else {
    error.value = 'Credenciales inválidas'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <img src="@/assets/farm-logo.png" alt="Logo" class="mx-auto h-24 w-auto">
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          GranjaApp
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sistema de Gestión de Finca
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Correo Electrónico</label>
            <input
              v-model="email"
              id="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Correo Electrónico"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Contraseña</label>
            <input
              v-model="password"
              id="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Contraseña"
            >
          </div>
        </div>

        <div>
          <p v-if="error" class="text-red-500 text-sm text-center mb-4">{{ error }}</p>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Iniciar Sesión
          </button>
        </div>
      </form>
    </div>
  </div>
</template>