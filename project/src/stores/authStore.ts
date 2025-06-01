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

  // Gestión de usuarios
  async function createUser(userData: UserForm) {
    // Verificar si el email ya existe
    if (usersList.value.some(u => u.email === userData.email)) {
      throw new Error('El email ya está registrado')
    }

    const newUser: User = {
      id: Date.now().toString(),
      ...userData
    }

    usersList.value.push(newUser)
    return newUser
  }

  async function updateUser(userData: User) {
    const index = usersList.value.findIndex(u => u.id === userData.id)
    if (index === -1) {
      throw new Error('Usuario no encontrado')
    }

    // Si es el único administrador, no permitir cambiar su rol
    const isLastAdmin = 
      usersList.value.filter(u => u.role === 'admin').length === 1 && 
      usersList.value[index].role === 'admin' && 
      userData.role !== 'admin'

    if (isLastAdmin) {
      throw new Error('No se puede cambiar el rol del único administrador')
    }

    // Mantener la contraseña actual si no se proporciona una nueva
    if (!userData.password) {
      userData.password = usersList.value[index].password
    }

    usersList.value[index] = { ...usersList.value[index], ...userData }
    
    // Si el usuario actualizado es el usuario actual, actualizar también el estado
    if (user.value?.id === userData.id) {
      user.value = usersList.value[index]
      sessionStorage.setItem('user', JSON.stringify(user.value))
    }

    return usersList.value[index]
  }

  async function toggleUserStatus(userId: string) {
    const index = usersList.value.findIndex(u => u.id === userId)
    if (index === -1) {
      throw new Error('Usuario no encontrado')
    }

    // No permitir desactivar al último administrador activo
    const isLastActiveAdmin = 
      usersList.value[index].role === 'admin' && 
      usersList.value[index].active && 
      usersList.value.filter(u => u.role === 'admin' && u.active).length === 1

    if (isLastActiveAdmin) {
      throw new Error('No se puede desactivar el único administrador activo')
    }

    // No permitir desactivar al usuario actual
    if (user.value?.id === userId) {
      throw new Error('No puedes desactivar tu propio usuario')
    }

    usersList.value[index].active = !usersList.value[index].active
    return usersList.value[index]
  }

  async function deleteUser(userId: string) {
    const index = usersList.value.findIndex(u => u.id === userId)
    if (index === -1) {
      throw new Error('Usuario no encontrado')
    }

    // No permitir eliminar al último administrador
    const isLastAdmin = 
      usersList.value[index].role === 'admin' && 
      usersList.value.filter(u => u.role === 'admin').length === 1

    if (isLastAdmin) {
      throw new Error('No se puede eliminar el único administrador')
    }

    // No permitir eliminar al usuario actual
    if (user.value?.id === userId) {
      throw new Error('No puedes eliminar tu propio usuario')
    }

    usersList.value = usersList.value.filter(u => u.id !== userId)
    return true
  }

  return {
    user,
    users,
    currentUser,
    isAuthenticated,
    authStatus,
    login,
    logout,
    initAuth,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser
  }
})
