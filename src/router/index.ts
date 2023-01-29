import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      redirect: (_to) => ({ path: '/app' }),
      children: [],
    },
    {
      path: '/app',
      name: 'app',
      component: () => import('../views/HomeView.vue'),
      redirect: (_to) => ({ path: '/app/linkedlist' }),
      children: [
        {
          path: 'linkedlist',
          name: 'linkedlist',
          component: () => import('../views/home/LinkedListView.vue'),
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
});
export default router;
