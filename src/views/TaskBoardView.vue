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
          <RouterLink v-if="userRole === 'admin' || userRole === 'pm'" to="/projects" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Manajemen Proyek</span>
          </RouterLink>
          <RouterLink to="/tasks" class="flex items-center gap-3 px-4 py-3 text-emerald-400 bg-slate-800/80 rounded-lg font-medium border-l-4 border-emerald-500">
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
      <header class="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800 shadow-sm">
        <div>
          <h2 class="text-xl font-bold text-white">Task Board</h2>
          <p class="text-xs text-slate-400">Pantau tugas dengan drag & drop</p>
        </div>
        
        <div class="flex items-center gap-3">
          <select v-model="selectedProject" class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
            <option value="">Semua Proyek</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <template v-if="userRole === 'admin' || userRole === 'pm'">
            <button @click="promptNewColumn" class="bg-slate-800 hover:bg-slate-700 text-white py-2 px-3 rounded-lg text-sm shadow-sm border border-slate-700">+ Kolom</button>
            <button @click="openFormModal()" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-lg text-sm shadow-sm">
              + Tambah Task
            </button>
          </template>
        </div>
      </header>

      <main class="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-950">
        <div v-if="isLoading" class="text-center py-12 text-slate-400">Memuat task board...</div>
        <div v-else class="flex items-start gap-6 h-full pb-4">
          
          <!-- Looping Kolom Task -->
          <div v-for="status in boardColumns" :key="status" @dragover.prevent @drop="onDrop($event, status)" class="bg-slate-900 border border-slate-800 rounded-xl flex flex-col w-80 shrink-0 max-h-full">
            
            <!-- Header Kolom -->
            <div class="p-3 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 rounded-t-xl z-10 group">
              
              <!-- Tampilan Mode Baca -->
              <div v-if="editingColumn !== status" class="flex items-center gap-2">
                <span class="font-bold text-slate-200 text-sm tracking-wide">{{ status }}</span>
                <span class="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold">{{ filteredTasks.filter(t => t.status === status).length }}</span>
              </div>
              
              <!-- Tampilan Mode Edit Kolom -->
              <div v-else class="flex-1 mr-2">
                <input v-model="columnEditName" @keyup.enter="saveColumnEdit(status)" class="w-full bg-slate-800 text-white text-sm px-2 py-1 rounded border border-emerald-500 focus:outline-none" />
              </div>

              <!-- Tombol Aksi Kolom (Hanya PM/Admin) -->
              <div v-if="userRole === 'admin' || userRole === 'pm'" class="flex items-center gap-2">
                <template v-if="editingColumn !== status">
                  <button @click="startEditColumn(status)" class="text-xs text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Edit Kolom">✏️</button>
                  <button @click="deleteColumn(status)" class="text-xs text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Hapus Kolom">🗑️</button>
                </template>
                <template v-else>
                  <button @click="saveColumnEdit(status)" class="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded">Simpan</button>
                  <button @click="editingColumn = null" class="text-xs text-slate-400 hover:text-white px-2 py-1">Batal</button>
                </template>
              </div>

            </div>
            
            <!-- Isi Task per Kolom -->
            <div class="p-3 flex-1 overflow-y-auto space-y-3 t-scrollbar">
              <div 
                v-for="task in filteredTasks.filter(t => t.status === status)" 
                :key="task.id" 
                draggable="true" 
                @dragstart="onDragStart(task)" 
                @click="openTaskDetail(task)"
                class="bg-slate-800 border border-slate-700/60 rounded-lg p-3 space-y-2 hover:border-emerald-500/50 hover:bg-slate-700/50 transition-all cursor-grab group"
              >
                <div class="flex justify-between items-start gap-2">
                  <div class="flex gap-1 flex-wrap">
                    <span class="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{{ task.project?.name || 'Umum' }}</span>
                    <span v-if="task.label" :class="getLabelClass(task.label)" class="text-[10px] font-bold px-2 py-0.5 rounded">{{ task.label }}</span>
                  </div>
                  <div v-if="task.assignee" class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0" :title="task.assignee.name">
                    {{ task.assignee.name.charAt(0) }}
                  </div>
                </div>
                
                <h4 class="text-white font-medium text-sm leading-snug">{{ task.title }}</h4>
                
                <div v-if="userRole === 'admin' || userRole === 'pm'" class="pt-2 border-t border-slate-700/50 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click.stop="deleteTask(task.id)" class="text-[11px] text-rose-400 hover:text-rose-300 font-medium">Hapus Task</button>
                </div>
              </div>

              <!-- Tombol Tambah Kartu Cepat -->
              <button v-if="userRole === 'admin' || userRole === 'pm'" @click="openFormModal(status)" class="w-full py-2 border-2 border-dashed border-slate-700 text-slate-500 rounded-lg hover:border-slate-500 hover:text-slate-300 transition-colors text-xs font-semibold">
                + Tambah Task
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Form Tambah Task -->
    <div v-if="showFormModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-lg font-bold text-white">Task Baru</h3>
          <button @click="showFormModal = false" class="text-slate-400 hover:text-white">&times;</button>
        </div>
        <form @submit.prevent="submitTask" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">PROYEK</label>
            <select v-model="form.project_id" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
              <option value="" disabled>-- Pilih Proyek --</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">JUDUL TASK</label>
            <input v-model="form.title" type="text" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">DETAIL TASK / DESKRIPSI</label>
            <textarea v-model="form.description" required rows="3" placeholder="Jelaskan detail tugas yang harus dikerjakan..." class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm t-scrollbar"></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">LABEL</label>
            <select v-model="form.label" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
              <option value="">Tanpa Label</option>
              <option value="Urgent">Urgent</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">STATUS</label>
              <select v-model="form.status" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                <option v-for="col in boardColumns" :key="col" :value="col">{{ col }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">TUGASKAN KE</label>
              <select v-model="form.assigned_to" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="">-- Kosong --</option>
                <option v-for="u in assignableUsers" :key="u.id" :value="u.id">{{ u.name }} ({{ u.role }})</option>
              </select>
            </div>
          </div>
          <div class="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button type="button" @click="showFormModal = false" class="px-4 py-2 text-slate-400 text-sm hover:text-white">Batal</button>
            <button type="submit" class="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-sm hover:bg-emerald-600">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Lihat Detail Task -->
    <div v-if="showDetailModal && detailTaskData" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-slate-800 flex justify-between items-start gap-4">
          <div>
            <div class="flex gap-2 mb-2">
              <span class="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{{ detailTaskData.project?.name || 'Umum' }}</span>
              <span v-if="detailTaskData.label" :class="getLabelClass(detailTaskData.label)" class="text-[10px] font-bold px-2 py-0.5 rounded">{{ detailTaskData.label }}</span>
            </div>
            <h3 class="text-xl font-bold text-white">{{ detailTaskData.title }}</h3>
          </div>
          <button @click="showDetailModal = false" class="text-slate-400 hover:text-white shrink-0">&times;</button>
        </div>

        <div class="p-6 overflow-y-auto t-scrollbar space-y-6">
          <div>
            <h4 class="text-xs font-semibold text-slate-400 mb-2">DETAIL TASK / DESKRIPSI</h4>
            <div class="bg-slate-800/50 p-4 rounded-lg text-sm text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-700/50">
              {{ detailTaskData.description || 'Tidak ada detail / deskripsi.' }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
              <h4 class="text-xs font-semibold text-slate-500 mb-1">STATUS SAAT INI</h4>
              <div class="text-sm font-medium text-white flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                {{ detailTaskData.status }}
              </div>
            </div>
            <div class="bg-slate-800/30 p-3 rounded-lg border border-slate-800">
              <h4 class="text-xs font-semibold text-slate-500 mb-1">DITUGASKAN KEPADA</h4>
              <div class="text-sm font-medium text-white flex items-center gap-2">
                <div v-if="detailTaskData.assignee" class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {{ detailTaskData.assignee.name.charAt(0) }}
                </div>
                {{ detailTaskData.assignee?.name || 'Belum di-assign' }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
           <button @click="showDetailModal = false" class="px-5 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors text-sm">Tutup</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const tasks = ref([])
const projects = ref([])
const users = ref([])
const isLoading = ref(true)

const userRole = ref(localStorage.getItem('user_role') || 'staff')
const userId = ref(parseInt(localStorage.getItem('user_id')))
const selectedProject = ref('')

// -- BAGIAN BARU: MENGAMBIL DAN MENYIMPAN KOLOM KE LOCAL STORAGE --
const savedColumns = localStorage.getItem('erp_board_columns')
const boardColumns = ref(savedColumns ? JSON.parse(savedColumns) : ['Todo', 'In Progress', 'Done'])

const saveColumnsToStorage = () => {
  localStorage.setItem('erp_board_columns', JSON.stringify(boardColumns.value))
}
// -----------------------------------------------------------------

const assignableUsers = computed(() => users.value.filter(u => u.role !== 'admin'))
const editingColumn = ref(null)
const columnEditName = ref('')
const showFormModal = ref(false)
const form = ref({ project_id: '', title: '', description: '', status: 'Todo', assigned_to: '', label: '' })
const draggedTask = ref(null)
const showDetailModal = ref(false)
const detailTaskData = ref(null)

const fetchInitData = async () => {
  isLoading.value = true
  try {
    const [taskRes, projRes, userRes] = await Promise.all([
      axios.get('/tasks'), axios.get('/projects'), axios.get('/users').catch(() => ({ data: [] }))
    ])
    tasks.value = taskRes.data
    projects.value = projRes.data
    if(userRes.data) users.value = userRes.data
    
    // Perbarui kolom dari database dan simpan jika ada status baru
    let isColumnsChanged = false
    tasks.value.forEach(t => {
      if (!boardColumns.value.includes(t.status)) {
        boardColumns.value.push(t.status)
        isColumnsChanged = true
      }
    })
    if (isColumnsChanged) saveColumnsToStorage()

  } catch (error) {
    console.error('Gagal memuat data:', error)
  } finally {
    isLoading.value = false
  }
}

const filteredTasks = computed(() => {
  let result = tasks.value
  if (selectedProject.value) result = result.filter(t => t.project_id === selectedProject.value)
  if (userRole.value === 'staff') result = result.filter(t => t.assigned_to === userId.value)
  return result
})

const promptNewColumn = () => {
  const colName = prompt('Masukkan nama kolom status baru:')
  if (colName && !boardColumns.value.includes(colName.trim())) {
    boardColumns.value.push(colName.trim())
    saveColumnsToStorage() // Simpan!
  }
}

const startEditColumn = (status) => {
  editingColumn.value = status
  columnEditName.value = status
}

const saveColumnEdit = async (oldStatus) => {
  if (!columnEditName.value.trim() || columnEditName.value === oldStatus) {
    editingColumn.value = null
    return
  }
  
  try {
    await axios.put('/tasks/column/update', { old_status: oldStatus, new_status: columnEditName.value })
    
    const index = boardColumns.value.indexOf(oldStatus)
    if (index !== -1) {
      boardColumns.value[index] = columnEditName.value
      saveColumnsToStorage() // Simpan!
    }
    editingColumn.value = null
    
    fetchInitData() 
  } catch (error) {
    alert('Gagal memperbarui nama kolom.')
  }
}

const deleteColumn = async (status) => {
  if (!confirm(`PERINGATAN!\n\nApakah Anda yakin ingin menghapus kolom "${status}"?\nSemua Task yang ada di dalam kolom ini akan ikut terhapus secara permanen!`)) return
  
  try {
    await axios.delete('/tasks/column/delete', { data: { status: status } })
    
    boardColumns.value = boardColumns.value.filter(c => c !== status)
    saveColumnsToStorage() // Simpan!
    fetchInitData() 
  } catch (error) {
    alert('Gagal menghapus kolom.')
  }
}

const openTaskDetail = (task) => {
  detailTaskData.value = task
  showDetailModal.value = true
}

const openFormModal = (defaultStatus = 'Todo') => {
  form.value = { 
    project_id: selectedProject.value || (projects.value[0]?.id || ''), 
    title: '', description: '', status: defaultStatus, assigned_to: '', label: '' 
  }
  showFormModal.value = true
}

const submitTask = async () => {
  try {
    await axios.post('/tasks', form.value)
    showFormModal.value = false
    fetchInitData()
  } catch (error) {
    alert('Gagal menyimpan task.')
  }
}

const deleteTask = async (id) => {
  if (!confirm('Hapus task ini?')) return
  try {
    await axios.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter(t => t.id !== id)
  } catch (error) {}
}

const onDragStart = (task) => { draggedTask.value = task }

const onDrop = async (event, newStatus) => {
  if (!draggedTask.value || draggedTask.value.status === newStatus) return
  const targetTask = draggedTask.value
  const oldStatus = targetTask.status
  targetTask.status = newStatus
  try {
    await axios.put(`/tasks/${targetTask.id}`, { status: newStatus })
  } catch (error) {
    targetTask.status = oldStatus
  } finally {
    draggedTask.value = null
  }
}

const getLabelClass = (label) => {
  switch(label) {
    case 'Urgent': return 'bg-rose-500/20 text-rose-400'
    case 'Frontend': return 'bg-blue-500/20 text-blue-400'
    case 'Backend': return 'bg-amber-500/20 text-amber-400'
    case 'Database': return 'bg-purple-500/20 text-purple-400'
    default: return 'bg-slate-500/20 text-slate-400'
  }
}

const handleLogout = async () => {
  try { await axios.post('/logout') } catch (e) {}
  localStorage.clear()
  router.push('/')
}

onMounted(() => { fetchInitData() })
</script>

<style scoped>
.t-scrollbar::-webkit-scrollbar { width: 6px; }
.t-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 4px; }
</style>