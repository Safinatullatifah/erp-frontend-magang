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
          <RouterLink to="/dashboard" class="flex items-center gap-3 px-4 py-3 text-emerald-400 bg-slate-800/80 rounded-lg font-medium border-l-4 border-emerald-500">
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
          <RouterLink to="/timesheets" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Timesheet</span>
          </RouterLink>
        </nav>
      </div>
      <div class="p-4 border-t border-slate-800">
        <button @click="handleLogout" class="w-full py-2.5 px-4 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-semibold transition-all">
          Keluar (Log Out)
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header dengan Filter Bulan -->
      <header class="flex items-center justify-between px-8 py-6 bg-slate-900 border-b border-slate-800 shadow-sm">
        <div>
          <h2 class="text-2xl font-bold text-white">
            Halo, {{ userRole === 'admin' ? 'Direksi' : (userRole === 'pm' ? 'Project Manager' : 'Tim Staff') }}!
          </h2>
          <p class="text-sm text-slate-400 mt-1">Ringkasan performa sistem bulan ini.</p>
        </div>
        <div class="flex gap-2">
          <select v-model="filterMonth" @change="fetchStats" class="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2">
            <option v-for="(m, i) in months" :key="i" :value="i + 1">{{ m }}</option>
          </select>
          <select v-model="filterYear" @change="fetchStats" class="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </header>

      <!-- Area Utama -->
      <main class="flex-1 overflow-y-auto p-8">
        <div v-if="isLoading" class="text-center py-12 text-slate-400 animate-pulse">Mengambil data analitik...</div>
        
        <div v-else class="space-y-6">
          
          <!-- TAMPILAN KHUSUS ADMIN & PM -->
          <template v-if="userRole === 'admin' || userRole === 'pm'">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 class="text-slate-400 text-sm font-semibold">Total Proyek</h3>
                <div class="mt-4 text-3xl font-bold text-white">{{ stats.total_projects }}</div>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 class="text-slate-400 text-sm font-semibold">Proyek Aktif (< 100%)</h3>
                <div class="mt-4 text-3xl font-bold text-white">{{ stats.active_projects }}</div>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 class="text-slate-400 text-sm font-semibold">Tugas Selesai</h3>
                <div class="mt-4 text-3xl font-bold text-white">{{ stats.completed_tasks }} <span class="text-sm text-slate-400">/ {{ stats.total_tasks }}</span></div>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 class="text-slate-400 text-sm font-semibold">Waktu Produktif</h3>
                <div class="mt-4 text-3xl font-bold text-white">{{ stats.total_hours }} <span class="text-sm text-slate-400">Jam</span></div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Grafik Beban Kerja -->
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm lg:col-span-2 h-80 flex flex-col">
                <h3 class="text-white font-bold mb-4">Grafik Beban Kerja Developer (Task Aktif)</h3>
                <div class="flex-1 relative">
                  <Bar v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
                  <div v-else class="text-slate-500 text-sm absolute inset-0 flex items-center justify-center">Tidak ada data staff.</div>
                </div>
              </div>
              <!-- Proyek Overdue -->
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
                <h3 class="text-rose-400 font-bold mb-4 flex items-center gap-2">⚠️ Proyek Overdue</h3>
                <div class="flex-1 overflow-y-auto space-y-3 t-scrollbar pr-2">
                  <div v-if="stats.overdue_projects?.length === 0" class="text-slate-500 text-sm text-center mt-10">Tidak ada proyek lewat tenggat.</div>
                  <div v-for="(op, i) in stats.overdue_projects" :key="i" class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                    <div class="text-white font-semibold text-sm">{{ op.name }}</div>
                    <div class="text-xs text-rose-300 mt-1">Deadline: {{ formatDate(op.deadline) }}</div>
                    <div class="text-xs text-slate-400 mt-1">Progress: {{ op.progress }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- TAMPILAN KHUSUS STAFF -->
          <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 class="text-slate-400 text-sm font-semibold">Task Aktif Saya Bulan Ini</h3>
                <div class="mt-4 text-3xl font-bold text-emerald-400">{{ stats.total_tasks }}</div>
              </div>
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 class="text-slate-400 text-sm font-semibold">Total Jam Kerja Saya Bulan Ini</h3>
                <div class="mt-4 text-3xl font-bold text-white">{{ stats.total_hours }} <span class="text-sm text-slate-400">Jam</span></div>
              </div>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 class="text-white font-bold mb-4">Daftar Task Aktif Saya</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-if="stats.active_tasks?.length === 0" class="col-span-full text-slate-500 text-center py-6">Yeay! Tidak ada task aktif.</div>
                <div 
                  v-for="task in stats.active_tasks" :key="task.id" 
                  @click="openTaskDetail(task)"
                  class="bg-slate-800 border border-slate-700 p-4 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors"
                >
                  <div class="text-xs text-emerald-400 font-bold mb-1">{{ task.project?.name || 'Umum' }}</div>
                  <div class="text-white font-semibold">{{ task.title }}</div>
                  <div class="text-xs text-slate-400 mt-2 bg-slate-900 inline-block px-2 py-1 rounded">Status: {{ task.status }}</div>
                </div>
              </div>
            </div>
          </template>

        </div>
      </main>
    </div>

    <!-- Modal Detail Task (Staff) -->
    <div v-if="showTaskModal && selectedTask" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 class="text-lg font-bold text-white">Detail Task</h3>
          <button @click="showTaskModal = false" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <div class="space-y-4 text-sm">
          <div>
            <div class="text-slate-400 text-xs font-semibold mb-1">PROYEK</div>
            <div class="text-white">{{ selectedTask.project?.name || '-' }}</div>
          </div>
          <div>
            <div class="text-slate-400 text-xs font-semibold mb-1">JUDUL TASK</div>
            <div class="text-white font-semibold">{{ selectedTask.title }}</div>
          </div>
          <div>
            <div class="text-slate-400 text-xs font-semibold mb-1">STATUS SAAT INI</div>
            <div class="text-emerald-400 font-bold">{{ selectedTask.status }}</div>
          </div>
          <div>
            <div class="text-slate-400 text-xs font-semibold mb-1">DESKRIPSI / DETAIL</div>
            <div class="text-slate-300 bg-slate-800 p-3 rounded-lg whitespace-pre-wrap">{{ selectedTask.description || 'Tidak ada deskripsi.' }}</div>
          </div>
        </div>
        <div class="mt-6 text-right">
          <button @click="showTaskModal = false" class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Tutup</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import axios from 'axios'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const router = useRouter()
const isLoading = ref(true)
const userRole = ref(localStorage.getItem('user_role') || 'staff')

// Filter Tanggal
const currentDate = new Date()
const filterMonth = ref(currentDate.getMonth() + 1)
const filterYear = ref(currentDate.getFullYear())
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const years = computed(() => {
  const currentY = new Date().getFullYear()
  return [currentY - 1, currentY, currentY + 1, currentY + 2]
})

const stats = ref({})

// Chart Khusus Admin/PM (Beban Kerja)
const chartData = computed(() => {
  if (!stats.value.developer_workloads) return { labels: [], datasets: [] }
  return {
    labels: stats.value.developer_workloads.map(d => d.name),
    datasets: [{
      label: 'Jumlah Task Aktif',
      backgroundColor: '#3b82f6',
      data: stats.value.developer_workloads.map(d => d.active_tasks),
      borderRadius: 4
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8', stepSize: 1 } },
    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
  }
}

// Modal Task Staff
const showTaskModal = ref(false)
const selectedTask = ref(null)
const openTaskDetail = (task) => {
  selectedTask.value = task
  showTaskModal.value = true
}

const fetchStats = async () => {
  isLoading.value = true
  try {
    // Ambil kolom dari storage untuk dikirim ke backend
    const savedColumns = localStorage.getItem('erp_board_columns')
    const cols = savedColumns ? JSON.parse(savedColumns).join(',') : 'Todo,In Progress,Done'
    
    const response = await axios.get(`/dashboard-stats?month=${filterMonth.value}&year=${filterYear.value}&columns=${cols}`)
    stats.value = response.data
  } catch (error) {
    console.error('Gagal memuat statistik:', error)
  } finally {
    isLoading.value = false
  }
}

const handleLogout = async () => {
  try { await axios.post('/logout') } catch (e) {}
  localStorage.clear()
  router.push('/')
}

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID')

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.t-scrollbar::-webkit-scrollbar { width: 6px; }
.t-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 4px; }
</style>