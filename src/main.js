import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import axios from 'axios' // Import axios

// Konfigurasi default Axios
axios.defaults.baseURL = 'http://localhost:8000/api'
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const app = createApp(App)

app.use(router)
app.mount('#app')