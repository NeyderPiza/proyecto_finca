<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'

const isSidebarOpen = ref(true)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

onMounted(() => {
  authStore.initAuth()
})
</script>

<template>
  <!-- Layout con sidebar y header solo para rutas autenticadas -->
  <div v-if="route.meta.requiresAuth" class="flex h-screen bg-blue-50">
    <Sidebar :is-open="isSidebarOpen" @toggle="toggleSidebar" />
    
    <div class="flex flex-col flex-1 overflow-hidden">
      <Header @toggle-sidebar="toggleSidebar" />
      
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>

  <!-- Rutas públicas sin layout (login) -->
  <div v-else>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>