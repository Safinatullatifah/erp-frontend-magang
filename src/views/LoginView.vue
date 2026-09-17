<template>
  <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6">
      <div class="text-center space-y-2">
        <div class="w-10 h-10 rounded-xl bg-emerald-500 mx-auto flex items-center justify-center font-bold text-slate-950 text-xl">
          E
        </div>
        <h2 class="text-2xl font-bold text-white tracking-wide">ERP System</h2>
        <p class="text-xs text-slate-400">Masuk ke akun kamu untuk mengelola proyek</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">EMAIL</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="admin@gmail.com"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">PASSWORD</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="••••••••"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>

        <div v-if="errorMessage" class="text-rose-400 text-xs bg-rose-950/50 border border-rose-800/50 p-3 rounded-lg">
          {{ errorMessage }}
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-bold rounded-lg transition-colors text-sm shadow-md"
        >
          {{ isLoading ? 'Memproses...' : 'Masuk Sekarang' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('/login', {
      email: email.value,
      password: password.value
    })

    // Simpan token dan role ke localStorage
    localStorage.setItem('access_token', response.data.access_token)
    localStorage.setItem('user_role', response.data.user.role)
    localStorage.setItem('user_id', response.data.user.id) // <-- Tambahan baru
    
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Login gagal! Periksa email & password.'
  } finally {
    isLoading.value = false
  }
}
</script>