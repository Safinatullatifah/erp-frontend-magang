import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

import './style.css'

// Atur URL dasar backend Laravel
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';

// Interceptor untuk menyisipkan Token otomatis di setiap request Axios
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const app = createApp(App)

app.use(router)

app.mount('#app')