<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits<{
  toggleSidebar: []
}>()

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/animals',
      query: { search: searchQuery.value }
    })
  }
}

const handleLogout = () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <header class="bg-white shadow-sm border-b border-blue-100 z-10">
    <div class="flex items-center justify-between px-4 py-3">
      <div class="flex items-center">
        <button
          @click="emit('toggleSidebar')"
          class="p-2 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:outline-none"
        >
          <i class="pi pi-bars"></i>
        </button>

        <div class="ml-4 md:block hidden">
          <h1 class="text-lg font-semibold text-blue-900">
            {{ $route.name }}
          </h1>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Buscar animales..."
            class="w-full md:w-64 px-4 py-2 pr-10 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button 
            @click="handleSearch"
            class="absolute right-0 top-0 h-full px-3 text-blue-400 hover:text-blue-600"
          >
            <i class="pi pi-search"></i>
          </button>
        </div>

        <button
          @click="handleLogout"
          class="flex items-center px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
          title="Cerrar sesión"
        >
          <i class="pi pi-power-off"></i>
        </button>
      </div>
    </div>
  </header>
</template>