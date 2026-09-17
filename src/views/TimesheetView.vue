<template>
  <div class="flex h-screen bg-slate-950 font-sans">
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
          <RouterLink v-if="userRole === 'admin' || userRole === 'pm'" to="/projects" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Manajemen Proyek</span>
          </RouterLink>
          <RouterLink to="/tasks" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Task Board</span>
          </RouterLink>
          <RouterLink to="/timesheets" class="flex items-center gap-3 px-4 py-3 text-emerald-400 bg-slate-800/80 rounded-lg font-medium border-l-4 border-emerald-500">
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

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800 shadow-sm">
        <div>
          <h2 class="text-xl font-bold text-white">Log Jam Kerja (Timesheet)</h2>
          <p class="text-xs text-slate-400">Pencatatan waktu kerja harian</p>
        </div>
        <button v-if="userRole === 'staff'" @click="openModal" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 shadow-sm">
          <span>+ Log Waktu</span>
        </button>
      </header>

      <main class="flex-1 overflow-y-auto p-8">
        <div v-if="isLoading" class="text-center py-12 text-slate-400">Memuat data timesheet...</div>
        <div v-else class="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-800/50 border-b border-slate-700 text-slate-300 text-sm">
                <th class="p-4 font-semibold">Tanggal</th>
                <th class="p-4 font-semibold">Tugas (Proyek)</th>
                <th class="p-4 font-semibold">Anggota Tim</th>
                <th class="p-4 font-semibold">Durasi</th>
                <th class="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="text-slate-300 text-sm">
              <tr v-if="timesheets.length === 0"><td colspan="5" class="p-8 text-center text-slate-500">Belum ada catatan waktu.</td></tr>
              <tr v-for="log in timesheets" :key="log.id" class="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td class="p-4 text-slate-400">{{ new Date(log.created_at).toLocaleDateString('id-ID') }}</td>
                <td class="p-4">
                  <div class="font-medium text-white">{{ log.task?.title || 'Tugas Terhapus' }}</div>
                  <div class="text-[11px] text-emerald-400">{{ log.task?.project?.name }}</div>
                </td>
                <td class="p-4 text-slate-300">{{ log.user?.name }}</td>
                <td class="p-4 font-semibold text-white">{{ log.hours }} Jam</td>
                <td class="p-4 text-center">
                  <!-- Fitur Hapus bisa diakses pembuat atau Admin/PM -->
                  <button v-if="userRole === 'admin' || userRole === 'pm' || log.user_id === userId" @click="deleteTimesheet(log.id)" class="text-rose-400 hover:text-rose-300 font-medium">Hapus</button>
                  <span v-else class="text-slate-500">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-lg font-bold text-white">Log Jam Kerja</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <form @submit.prevent="submitTimesheet" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">TUGAS YANG DIKERJAKAN</label>
            <select v-model="form.task_id" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
              <option value="" disabled>-- Pilih Tugas --</option>
              <option v-for="t in tasks" :key="t.id" :value="t.id">{{ t.title }} ({{ t.project?.name }})</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">DURASI (JAM)</label>
            <input v-model="form.hours" type="number" step="0.5" min="0.5" required placeholder="Contoh: 2.5" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" @click="closeModal" class="px-4 py-2 text-slate-400 text-sm">Batal</button>
            <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-sm">
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Log' }}
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
const timesheets = ref([])
const tasks = ref([])
const isLoading = ref(true)
const showModal = ref(false)
const isSubmitting = ref(false)
const userRole = ref(localStorage.getItem('user_role') || 'staff')
const userId = ref(parseInt(localStorage.getItem('user_id')))

const form = ref({ task_id: '', hours: '' })

const fetchTimesheets = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('/timesheets')
    timesheets.value = response.data
  } catch (error) {
    console.error('Gagal memuat timesheet:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchTasks = async () => {
  try {
    const response = await axios.get('/tasks')
    tasks.value = response.data
  } catch (error) {}
}

const submitTimesheet = async () => {
  isSubmitting.value = true
  try {
    await axios.post('/timesheets', form.value)
    closeModal()
    fetchTimesheets()
  } catch (error) {
    alert('Gagal menyimpan log waktu.')
  } finally {
    isSubmitting.value = false
  }
}

const deleteTimesheet = async (id) => {
  if (!confirm('Hapus log waktu ini?')) return
  try {
    await axios.delete(`/timesheets/${id}`)
    fetchTimesheets()
  } catch (error) {}
}

const openModal = () => {
  form.value = { task_id: tasks.value[0]?.id || '', hours: '' }
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const handleLogout = async () => {
  try { await axios.post('/logout') } catch (e) {}
  localStorage.clear()
  router.push('/')
}

onMounted(() => {
  fetchTimesheets()
  if (userRole.value === 'staff') fetchTasks()
})
</script>