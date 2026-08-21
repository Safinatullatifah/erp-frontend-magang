import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProjectView from '../views/ProjectView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      // Jika sudah login, cegah user kembali ke halaman login
      beforeEnter: (to, from, next) => {
        if (localStorage.getItem('access_token')) {
          next({ name: 'dashboard' })
        } else {
          next()
        }
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true } // Penanda bahwa rute ini butuh login
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectView,
      meta: { requiresAuth: true }
    }
  ]
})

// Middleware Global Vue Router
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('access_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Jika rute butuh login tapi tidak ada token, lempar ke halaman login
    next({ name: 'login' })
  } else {
    next()
  }
})


export default router