<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const router = useRouter()
const route = useRoute()

const navigationItems = [
  { name: 'Panel Principal', path: '/', icon: 'pi pi-home' },
  { name: 'Animales', path: '/animals', icon: 'pi pi-list' },
  { name: 'Vacunaciones', path: '/vaccinations', icon: 'pi pi-calendar' },
  { name: 'Finanzas', path: '/finance', icon: 'pi pi-dollar' },
  { name: 'Informes', path: '/reports', icon: 'pi pi-chart-bar' },
  { name: 'Producción de Leche', path: '/milk-production', icon: 'pi pi-chart-bar' }
]

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <div
    class="sidebar bg-white shadow-md flex flex-col transition-all duration-300"
    :class="{ 'w-64': isOpen, 'w-20': !isOpen }"
  >
    <div class="p-4 flex items-center justify-between border-b border-blue-100">
      <div class="flex items-center space-x-3" :class="{ 'justify-center': !isOpen }">
        <img src="/src/assets/farm-logo.png" alt="Logo Granja" class="h-10 w-10" />
        <h1 v-if="isOpen" class="text-xl font-bold text-blue-600">GranjaApp</h1>
      </div>
      <button
        @click="emit('toggle')"
        class="text-blue-500 hover:text-blue-700 focus:outline-none"
      >
        <i :class="isOpen ? 'pi pi-chevron-left' : 'pi pi-chevron-right'"></i>
      </button>
    </div>

    <nav class="flex-1 px-2 py-4 space-y-1">
      <a
        v-for="item in navigationItems"
        :key="item.name"
        :href="item.path"
        @click.prevent="router.push(item.path)"
        :class="[
          isActive(item.path)
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600',
          'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200'
        ]"
      >
        <i
          :class="[
            item.icon,
            isActive(item.path) ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-600',
            'mr-3 text-lg'
          ]"
        ></i>
        <span v-if="isOpen">{{ item.name }}</span>
      </a>
    </nav>
  </div>
</template>