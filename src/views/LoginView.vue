<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-xl shadow-sm w-96 border border-gray-200">
      <h2 class="text-2xl font-bold text-center text-indigo-600 mb-6">Login ERP</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="email" type="email" required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input v-model="password" type="password" required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </div>

        <!-- Pesan Error -->
        <div v-if="errorMessage" class="text-red-500 text-sm text-center bg-red-50 py-2 rounded">
          {{ errorMessage }}
        </div>
        
        <button type="submit" 
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium mt-4">
          Masuk
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

const handleLogin = async () => {
  errorMessage.value = ''; // Reset pesan error
  try {
    // Mengirim request ke API Laravel
    const response = await axios.post('http://127.0.0.1:8000/api/login', {
      email: email.value,
      password: password.value
    });
    
    // Simpan token ke localStorage browser
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user_role', response.data.user.role); // Simpan role untuk filter menu
    
    // Arahkan otomatis ke halaman Dashboard
    router.push('/dashboard');
    
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Koneksi ke server gagal.';
  }
};
</script>