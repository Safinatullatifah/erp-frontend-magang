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
          <RouterLink v-if="userRole === 'admin'" to="/users" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Manajemen Akun</span>
          </RouterLink>
          <RouterLink to="/projects" class="flex items-center gap-3 px-4 py-3 text-emerald-400 bg-slate-800/80 rounded-lg font-medium border-l-4 border-emerald-500">
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
          <h2 class="text-xl font-bold text-white">Manajemen Proyek</h2>
          <p class="text-xs text-slate-400">Kelola proyek dan assign tim developer</p>
        </div>
        <button v-if="userRole === 'admin' || userRole === 'pm'" @click="openModal()" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-lg text-sm">
          + Tambah Proyek
        </button>
      </header>

      <main class="flex-1 overflow-y-auto p-8">
        <div v-if="isLoading" class="text-center py-12 text-slate-400">Memuat data proyek...</div>
        <div v-else class="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-800/50 border-b border-slate-700 text-slate-300 text-sm">
                <th class="p-4 font-semibold">Nama Proyek</th>
                <th class="p-4 font-semibold">Tim Terlibat</th>
                <th class="p-4 font-semibold">Progress</th>
                <th class="p-4 font-semibold">Tenggat Waktu</th>
                <th v-if="userRole === 'admin' || userRole === 'pm'" class="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="text-slate-300 text-sm">
              <tr v-if="projects.length === 0"><td colspan="5" class="p-8 text-center text-slate-500">Belum ada proyek.</td></tr>
              <tr v-for="project in projects" :key="project.id" class="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td class="p-4 font-medium text-white">{{ project.name }}<br><span class="text-xs text-slate-400">{{ project.client }}</span></td>
                <td class="p-4 text-xs">
                  <span v-for="u in project.users" :key="u.id" class="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded mr-1 mb-1">
                    {{ u.name }}
                  </span>
                  <span v-if="!project.users?.length" class="text-slate-500">Belum ada tim</span>
                </td>
                <td class="p-4">
                  <!-- Progress Bar Otomatis -->
                  <div class="flex items-center gap-2">
                    <div class="w-full bg-slate-700 rounded-full h-2.5 max-w-[100px]">
                      <div class="bg-emerald-500 h-2.5 rounded-full" :style="{ width: project.calculated_status }"></div>
                    </div>
                    <span class="text-xs font-bold text-emerald-400">{{ project.calculated_status }}</span>
                  </div>
                </td>
                <td class="p-4">{{ formatDate(project.deadline) }}</td>
                <td v-if="userRole === 'admin' || userRole === 'pm'" class="p-4 text-center space-x-3">
                  <button @click="openModal(project)" class="text-amber-400 hover:text-amber-300">Edit</button>
                  <button @click="deleteProject(project.id)" class="text-rose-400 hover:text-rose-300">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 class="text-lg font-bold text-white">{{ isEditing ? 'Edit Proyek' : 'Tambah Proyek' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <form @submit.prevent="submitProject" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">NAMA PROYEK</label>
            <input v-model="form.name" type="text" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">KLIEN</label>
            <input v-model="form.client" type="text" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          
          <div class="relative">
            <label class="block text-xs font-semibold text-slate-400 mb-1">ASSIGN TIM</label>
            <div @click="isTeamDropdownOpen = !isTeamDropdownOpen" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm cursor-pointer flex justify-between items-center hover:border-emerald-500 transition-colors">
              <span class="truncate text-slate-300">
                {{ form.team_ids.length > 0 ? staffUsers.filter(u => form.team_ids.includes(u.id)).map(u => u.name).join(', ') : '-- Pilih Anggota Tim --' }}
              </span>
              <span class="text-slate-400 text-xs">▼</span>
            </div>
            <div v-if="isTeamDropdownOpen" class="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto t-scrollbar">
              <label v-for="user in staffUsers" :key="user.id" class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-0">
                <input type="checkbox" :value="user.id" v-model="form.team_ids" class="accent-emerald-500 w-4 h-4 rounded cursor-pointer" />
                {{ user.name }} <span class="text-xs text-slate-400">({{ user.role }})</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">DEADLINE</label>
            <input v-model="form.deadline" type="date" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" @click="closeModal" class="px-4 py-2 text-slate-400 text-sm">Batal</button>
            <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-sm">
              {{ isSubmitting ? 'Saving...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const projects = ref([])
const allUsers = ref([])
const isLoading = ref(true)
const showModal = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editId = ref(null)
const userRole = ref(localStorage.getItem('user_role') || 'staff')

const isTeamDropdownOpen = ref(false)
const form = ref({ name: '', client: '', deadline: '', team_ids: [] })

const staffUsers = computed(() => allUsers.value.filter(u => u.role !== 'admin'))

const fetchData = async () => {
  isLoading.value = true
  try {
    // Ambil kolom dari storage untuk dikirim ke backend
    const savedColumns = localStorage.getItem('erp_board_columns')
    const cols = savedColumns ? JSON.parse(savedColumns).join(',') : 'Todo,In Progress,Done'

    const [projRes, userRes] = await Promise.all([
      axios.get(`/projects?columns=${cols}`),
      axios.get('/users')
    ])
    projects.value = projRes.data
    allUsers.value = userRes.data
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    isLoading.value = false
  }
}

const submitProject = async () => {
  isSubmitting.value = true
  try {
    if (isEditing.value) {
      await axios.put(`/projects/${editId.value}`, form.value)
    } else {
      await axios.post('/projects', form.value)
    }
    closeModal()
    fetchData()
  } catch (error) {
    alert('Gagal menyimpan proyek.')
  } finally {
    isSubmitting.value = false
  }
}

const deleteProject = async (id) => {
  if (!confirm('Hapus proyek ini?')) return
  try {
    await axios.delete(`/projects/${id}`)
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const openModal = (project = null) => {
  isTeamDropdownOpen.value = false
  if (project) {
    isEditing.value = true
    editId.value = project.id
    form.value = {
      name: project.name,
      client: project.client,
      deadline: project.deadline.split('T')[0], // format date for input
      team_ids: project.users ? project.users.map(u => u.id) : []
    }
  } else {
    isEditing.value = false
    editId.value = null
    form.value = { name: '', client: '', deadline: '', team_ids: [] }
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const handleLogout = async () => {
  try { await axios.post('/logout') } catch (e) {}
  localStorage.clear()
  router.push('/')
}

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID')
onMounted(() => { fetchData() })
</script>

<style scoped>
.t-scrollbar::-webkit-scrollbar { width: 6px; }
.t-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 4px; }
</style>