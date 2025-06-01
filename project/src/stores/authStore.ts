import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserForm } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  // Lista de usuarios
  const usersList = ref<User[]>([
    {
      id: '1',
      name: 'Administrador',
      email: 'admin@fincapiza.com',
      password: 'admin123',
      role: 'admin',
      active: true
    }
  ])

  // Getters
  const currentUser = computed(() => user.value)
  const authStatus = computed(() => isAuthenticated.value)
  const users = computed(() => usersList.value)

  // Actions
  function login(email: string, password: string): boolean {
    const foundUser = usersList.value.find((u: User) => u.email === email && u.password === password && u.active)
    if (foundUser) {
      user.value = foundUser
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
    currentUser,
    isAuthenticated,
    authStatus,
    login,
    logout,
    initAuth
  }
})
