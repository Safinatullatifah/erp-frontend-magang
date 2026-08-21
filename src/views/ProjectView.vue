<template>
  <div class="flex h-screen bg-slate-950 font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 shadow-xl flex flex-col justify-between border-r border-slate-800">
      <div>
        <div class="p-6 border-b border-slate-800 flex items-center gap-3">
          <div class="w-4 h-4 rounded bg-emerald-500"></div>
          <h1 class="text-xl font-bold text-white tracking-wide">ERP System</h1>
        </div>
        
        <nav class="mt-6 px-3 space-y-1">
          <RouterLink to="/dashboard" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Dashboard</span>
          </RouterLink>
          <!-- Menu Aktif -->
          <RouterLink to="/projects" class="flex items-center gap-3 px-4 py-3 text-emerald-400 bg-slate-800/80 rounded-lg font-medium border-l-4 border-emerald-500">
            <span>Manajemen Proyek</span>
          </RouterLink>
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Task Board</span>
          </a>
          <a href="#" class="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors font-medium">
            <span>Timesheet</span>
          </a>
        </nav>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header -->
      <header class="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800 shadow-sm">
        <div>
          <h2 class="text-xl font-bold text-white">Manajemen Proyek</h2>
          <p class="text-xs text-slate-400">Daftar semua proyek aktif dan statusnya</p>
        </div>
        
        <!-- Tombol Tambah Proyek -->
        <button class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2">
          <span>+ Tambah Proyek</span>
        </button>
      </header>

      <!-- Main Area Content -->
      <main class="flex-1 overflow-y-auto p-8">
        <!-- Tabel Proyek -->
        <div class="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-800/50 border-b border-slate-700 text-slate-300 text-sm">
                <th class="p-4 font-semibold">Nama Proyek</th>
                <th class="p-4 font-semibold">Klien</th>
                <th class="p-4 font-semibold">Status</th>
                <th class="p-4 font-semibold">Tenggat Waktu</th>
                <th class="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="text-slate-300 text-sm">
              <!-- Baris Dummy 1 -->
              <tr class="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td class="p-4 font-medium text-white">Redesign Website Profil</td>
                <td class="p-4">PT Makmur Jaya</td>
                <td class="p-4">
                  <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">In Progress</span>
                </td>
                <td class="p-4">25 Agustus 2026</td>
                <td class="p-4 text-center">
                  <button class="text-emerald-400 hover:text-emerald-300 font-medium">Detail</button>
                </td>
              </tr>
              <!-- Baris Dummy 2 -->
              <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="p-4 font-medium text-white">Aplikasi Mobile E-Commerce</td>
                <td class="p-4">CV Bintang Terang</td>
                <td class="p-4">
                  <span class="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">Planning</span>
                </td>
                <td class="p-4">10 September 2026</td>
                <td class="p-4 text-center">
                  <button class="text-emerald-400 hover:text-emerald-300 font-medium">Detail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>