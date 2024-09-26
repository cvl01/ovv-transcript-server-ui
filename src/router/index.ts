import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DetailView from '../views/DetailView.vue';
import ProjectView from '../views/ProjectView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/detail/:id', component: DetailView },
  { path: '/project/:id', component: ProjectView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
