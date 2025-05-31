import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  // Usuario predefinido (esto luego se moverá a una base de datos)
  const validUser = {
    email: 'admin@fincapiza.com',
    password: 'admin123'
  }

  // Getters
  const currentUser = computed(() => user.value)
  const authStatus = computed(() => isAuthenticated.value)

  // Actions
  function login(email: string, password: string): boolean {
    if (email === validUser.email && password === validUser.password) {
      user.value = { email, password }
      isAuthenticated.value = true
      // Guardar en sessionStorage para mantener la sesión
      sessionStorage.setItem('user', JSON.stringify(user.value))
      sessionStorage.setItem('isAuthenticated', 'true')
      return true
    }
    return false
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
    // Limpiar sessionStorage
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('isAuthenticated')
  }

  // Verificar si hay una sesión guardada al iniciar
  function initAuth() {
    const savedUser = sessionStorage.getItem('user')
    const savedAuth = sessionStorage.getItem('isAuthenticated')
    
    if (savedUser && savedAuth) {
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    }
  }

  return {
    user,
    isAuthenticated,
    currentUser,
    authStatus,
    login,
    logout,
    initAuth
  }
})
