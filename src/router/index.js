import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '../views/SearchView.vue'
import CategoriesView from '../views/CategoriesView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/layouts/default/Default.vue'),
      children: [
        {
          path: '/',
          name: 'Home',
          // route level code-splitting
          // this generates a separate chunk (Home-[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: CategoriesView,
        },

        {
          path: '/search',
          name: 'Search',
          // route level code-splitting
          // this generates a separate chunk (Home-[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: SearchView,
        },



        {
          path: '/food/:food',
          name: 'Food',
          // route level code-splitting
          // this generates a separate chunk (Home-[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('@/views/FoodView.vue'),
        },
      ],
    },
  
  ]
})

export default router
