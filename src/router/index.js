import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProjectView from '../views/ProjectView.vue'
import TaskBoardView from '../views/TaskBoardView.vue'
import TimesheetView from '../views/TimesheetView.vue'
import UserManagementView from '../views/UserManagementView.vue' // Import view baru

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/projects', name: 'projects', component: ProjectView },
    { path: '/tasks', name: 'tasks', component: TaskBoardView },
    { path: '/timesheets', name: 'timesheets', component: TimesheetView },
    { path: '/users', name: 'users', component: UserManagementView }, // Rute baru
  ]
})

export default router