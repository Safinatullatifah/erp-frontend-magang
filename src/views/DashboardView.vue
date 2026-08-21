<template>
  <div class="flex h-screen bg-slate-950 font-sans">
    <!-- Sidebar: Tetap Dark Slate 900, ditambah border kanan biar tidak menyatu dengan background utama -->
    <aside class="w-64 bg-slate-900 shadow-xl flex flex-col justify-between border-r border-slate-800">
      <div>
        <div class="p-6 border-b border-slate-800 flex items-center gap-3">
          <div class="w-4 h-4 rounded bg-emerald-500"></div>
          <h1 class="text-xl font-bold text-white tracking-wide">ERP System</h1>
        </div>
        
        <nav class="mt-6 px-3 space-y-1">
          <!-- Menu Aktif -->
          <RouterLink to="/dashboard" class="flex items-center gap-3 px-4 py-3 text-emerald-400 bg-slate-800/80 rounded-lg font-medium border-l-4 border-emerald-500">
            <span>Dashboard</span>
          </RouterLink>
          <RouterLink to="/projects" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Manajemen Proyek</span>
          </RouterLink>
        </nav>
      </div>

      <!-- Tombol Logout -->
      <div class="p-4 border-t border-slate-800">
        <button @click="handleLogout" class="w-full py-2.5 px-4 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-semibold transition-all">
          Keluar (Log Out)
        </button>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header: Diubah ke Slate 900 -->
      <header class="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800 shadow-sm">
        <div>
          <h2 class="text-xl font-bold text-white">Dashboard Utama</h2>
          <p class="text-xs text-slate-400">Ringkasan aktivitas & operasional tim</p>
        </div>
        
        <!-- User Profile Tag -->
        <div class="flex items-center gap-3 pl-4 border-l border-slate-700">
          <div class="text-right">
            <p class="text-sm font-bold text-white leading-tight">{{ user.name || 'Memuat...' }}</p>
            <span class="inline-block text-[11px] font-semibold text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-800/50">
              {{ user.role || 'Staff' }}
            </span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center font-bold shadow-sm border border-slate-700">
            {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
          </div>
        </div>
      </header>

      <!-- Main Area Content -->
      <main class="flex-1 overflow-y-auto p-8 space-y-6">
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between border border-slate-700/50">
          <div class="space-y-1">
            <h3 class="text-2xl font-bold">Selamat Datang, {{ user.name }}! 👋</h3>
            <p class="text-slate-300 text-sm">Semua modul operasional sudah terhubung dengan akun role <b class="text-emerald-400">{{ user.role }}</b>.</p>
          </div>
          <span class="px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold rounded-lg">
            Sistem Aktif
          </span>
        </div>

        <!-- Metric Cards: Diubah ke Slate 900 dengan border gelap -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
            <p class="text-xs font-semibold text-slate-400 uppercase">Total Proyek</p>
            <p class="text-2xl font-bold text-white mt-1">12</p>
            <div class="mt-3 flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <span>●</span> 3 proyek aktif minggu ini
            </div>
          </div>

          <div class="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
            <p class="text-xs font-semibold text-slate-400 uppercase">Tugas Selesai</p>
            <p class="text-2xl font-bold text-white mt-1">84%</p>
            <div class="mt-3 flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <span>↑</span> On-track sesuai deadline
            </div>
          </div>

          <div class="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
            <p class="text-xs font-semibold text-slate-400 uppercase">Log Timesheet</p>
            <p class="text-2xl font-bold text-white mt-1">38.5 Jam</p>
            <div class="mt-3 flex items-center gap-1 text-xs text-amber-400 font-medium">
              <span>⏱</span> Butuh approval PM
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const user = ref({});

// Fungsi untuk mengambil data profil saat halaman dimuat
const fetchUser = async () => {
  try {
    const response = await axios.get('/user');
    user.value = response.data;
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    // Jika token tidak valid/expired, paksa logout
    if (error.response && error.response.status === 401) {
      handleLogout();
    }
  }
};

// Fungsi untuk Log Out
const handleLogout = async () => {
  try {
    // Meminta backend untuk menghapus token
    await axios.post('/logout');
  } catch (error) {
    console.error("Error saat logout:", error);
  } finally {
    // Apapun yang terjadi di server, hapus token di browser dan kembali ke Login
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    router.push('/');
  }
};

// Jalankan fetchUser saat komponen pertama kali dirender
onMounted(() => {
  fetchUser();
});
</script>