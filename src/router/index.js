import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '../views/SearchView.vue'
import CategoriesView from '../views/CategoriesView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import { useLoadingStore } from '../stores/loading';

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
          path: '/login',
          name: 'Login',
          component: LoginView,
        },

        {
          path: '/register',
          name: 'Register',
          component: RegisterView,
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

        {
          path: '/recipe',
          name: 'Recipe',
          component: () => import('@/views/RecipeView.vue'),
        },


        {
          path: '/analyze',
          name: 'Analyze',
          component: () => import('@/views/AnalyzeView.vue'),
        },
      ],
    },
  
  ]
})

router.beforeEach((to, from, next) => {
  const loadingStore = useLoadingStore();
  loadingStore.setLoading(true);
  next();
});

router.afterEach(() => {
  const loadingStore = useLoadingStore();
  loadingStore.setLoading(false);
});

export default router
