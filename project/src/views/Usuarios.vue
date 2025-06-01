<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import type { User, UserForm } from '@/types/user'

const authStore = useAuthStore()
const showForm = ref(false)
const editingUserId = ref('')

const formData = ref<UserForm>({
  name: '',
  email: '',
  password: '',
  role: 'user',
  active: true
})

const users = computed(() => authStore.users)

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    active: true
  }
  editingUserId.value = ''
  showForm.value = false
}

const handleSubmit = async () => {
  try {
    if (editingUserId.value) {
      await authStore.updateUser({
        ...formData.value,
        id: editingUserId.value
      })
    } else {
      await authStore.createUser(formData.value)
    }
    resetForm()
  } catch (error: any) {
    alert(error.message)
  }
}

const editUser = (user: User) => {
  editingUserId.value = user.id
  formData.value = {
    name: user.name,
    email: user.email,
    password: '', // No incluimos la contraseña por seguridad
    role: user.role,
    active: user.active
  }
  showForm.value = true
}

const toggleUserStatus = async (userId: string) => {
  try {
    await authStore.toggleUserStatus(userId)
  } catch (error: any) {
    alert(error.message)
  }
}

const deleteUser = async (userId: string) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return
  
  try {
    await authStore.deleteUser(userId)
  } catch (error: any) {
    alert(error.message)
  }
}
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-blue-900">Gestión de Usuarios</h1>
        <p class="text-gray-600">Administra los usuarios del sistema</p>
      </div>
      <button
        @click="showForm = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <i class="pi pi-plus mr-2"></i>
        Nuevo Usuario
      </button>
    </div>

    <!-- Modal de Formulario -->
    <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ editingUserId ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              Contraseña {{ editingUserId ? '(dejar en blanco para mantener)' : '' }}
            </label>
            <input
              v-model="formData.password"
              type="password"
              :required="!editingUserId"
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Rol</label>
            <select
              v-model="formData.role"
              required
              class="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300"
            >
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
            </select>
          </div>

          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="formData.active"
              class="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label class="ml-2 text-sm font-medium text-gray-700">Usuario Activo</label>
          </div>

          <div class="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              @click="resetForm"
              class="px-4 py-2 border border-gray-300 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {{ editingUserId ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabla de Usuarios -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap capitalize">{{ user.role }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'px-2 py-1 text-sm rounded-full': true,
                    'bg-green-100 text-green-800': user.active,
                    'bg-red-100 text-red-800': !user.active
                  }"
                >
                  {{ user.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button
                  @click="editUser(user)"
                  class="text-blue-600 hover:text-blue-900 mx-2"
                  title="Editar"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  @click="toggleUserStatus(user.id)"
                  :class="{
                    'mx-2': true,
                    'text-green-600 hover:text-green-900': !user.active,
                    'text-red-600 hover:text-red-900': user.active
                  }"
                  :title="user.active ? 'Desactivar' : 'Activar'"
                >
                  <i :class="user.active ? 'pi pi-lock' : 'pi pi-lock-open'"></i>
                </button>
                <button
                  @click="deleteUser(user.id)"
                  class="text-red-600 hover:text-red-900 mx-2"
                  title="Eliminar"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
