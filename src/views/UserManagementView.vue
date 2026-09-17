<template>
  <div class="flex h-screen bg-slate-950 font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 shadow-xl flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        <div class="p-6 border-b border-slate-800 flex items-center gap-3">
          <div class="w-4 h-4 rounded bg-emerald-500"></div>
          <h1 class="text-xl font-bold text-white tracking-wide">ERP System</h1>
        </div>
        <nav class="mt-6 px-3 space-y-1">
          <RouterLink to="/dashboard" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Dashboard</span>
          </RouterLink>
          <RouterLink to="/users" class="flex items-center gap-3 px-4 py-3 text-emerald-400 bg-slate-800/80 rounded-lg font-medium border-l-4 border-emerald-500">
            <span>Manajemen Akun</span>
          </RouterLink>
          <RouterLink to="/projects" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Manajemen Proyek</span>
          </RouterLink>
          <RouterLink to="/tasks" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Task Board</span>
          </RouterLink>
          <RouterLink to="/timesheets" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Timesheet</span>
          </RouterLink>
        </nav>
      </div>
      <div class="p-4 border-t border-slate-800">
        <button @click="handleLogout" class="w-full py-2.5 px-4 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-semibold transition-all">
          Keluar (Log Out)
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800">
        <div>
          <h2 class="text-xl font-bold text-white">Manajemen Akun</h2>
          <p class="text-xs text-slate-400">Kelola akses Direksi, PM, dan Staff</p>
        </div>
        <button @click="openModal()" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-lg text-sm shadow-sm">
          + Tambah Akun
        </button>
      </header>

      <main class="flex-1 overflow-y-auto p-8">
        <div v-if="isLoading" class="text-center py-12 text-slate-400">Memuat data pengguna...</div>
        <div v-else class="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-800/50 border-b border-slate-700 text-slate-300 text-sm">
                <th class="p-4 font-semibold">Nama Lengkap</th>
                <th class="p-4 font-semibold">Email</th>
                <th class="p-4 font-semibold">Role Akses</th>
                <th class="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="text-slate-300 text-sm">
              <tr v-if="users.length === 0"><td colspan="4" class="p-8 text-center text-slate-500">Belum ada akun.</td></tr>
              <tr v-for="user in users" :key="user.id" class="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td class="p-4 font-medium text-white">{{ user.name }}</td>
                <td class="p-4">{{ user.email }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    {{ user.role }}
                  </span>
                </td>
                <td class="p-4 text-center space-x-3">
                  <button @click="openModal(user)" class="text-amber-400 hover:text-amber-300">Edit</button>
                  <button @click="deleteUser(user.id)" class="text-rose-400 hover:text-rose-300" :disabled="user.id === currentUserId" :class="{'opacity-50 cursor-not-allowed': user.id === currentUserId}">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-lg font-bold text-white">{{ isEditing ? 'Edit Akun' : 'Tambah Akun Baru' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <form @submit.prevent="submitUser" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">NAMA LENGKAP</label>
            <input v-model="form.name" type="text" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">EMAIL LOGIN</label>
            <input v-model="form.email" type="email" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">ROLE AKSES</label>
            <select v-model="form.role" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
              <option value="admin">Admin / Direksi</option>
              <option value="pm">Project Manager (PM)</option>
              <option value="staff">Tim Developer / Staff</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">
              PASSWORD {{ isEditing ? '(Kosongkan jika tidak ingin diubah)' : '' }}
            </label>
            <input v-model="form.password" type="password" :required="!isEditing" placeholder="Minimal 6 karakter" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
          <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" @click="closeModal" class="px-4 py-2 text-slate-400 text-sm">Batal</button>
            <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-sm">
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Akun' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const users = ref([])
const isLoading = ref(true)
const showModal = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editId = ref(null)
const currentUserId = ref(parseInt(localStorage.getItem('user_id')))

const form = ref({ name: '', email: '', role: 'staff', password: '' })

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const res = await axios.get('/users')
    users.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const submitUser = async () => {
  isSubmitting.value = true
  try {
    if (isEditing.value) {
      await axios.put(`/users/${editId.value}`, form.value)
    } else {
      await axios.post('/users', form.value)
    }
    closeModal()
    fetchUsers()
  } catch (error) {
    alert(error.response?.data?.message || 'Gagal menyimpan akun.')
  } finally {
    isSubmitting.value = false
  }
}

const deleteUser = async (id) => {
  if (!confirm('Yakin ingin menghapus akun ini?')) return
  try {
    await axios.delete(`/users/${id}`)
    fetchUsers()
  } catch (error) {
    alert('Gagal menghapus akun.')
  }
}

const openModal = (user = null) => {
  if (user) {
    isEditing.value = true
    editId.value = user.id
    form.value = { name: user.name, email: user.email, role: user.role, password: '' }
  } else {
    isEditing.value = false
    editId.value = null
    form.value = { name: '', email: '', role: 'staff', password: '' }
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const handleLogout = async () => {
  try { await axios.post('/logout') } catch (e) {}
  localStorage.clear()
  router.push('/')
}

onMounted(() => { fetchUsers() })
</script>