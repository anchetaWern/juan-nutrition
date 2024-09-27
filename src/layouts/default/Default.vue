<template>
  <v-app>
    <default-bar :updateItems="updateItems" :ingredientCount="ingredientCount" />

    <default-view :items="items" @konto="konto" />
  </v-app>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'

import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'

const router = useRouter();

const ingredientCount = ref(0);

onMounted(() => {
  const recipe_data = JSON.parse(localStorage.getItem('recipe'));
  if (recipe_data) {
    ingredientCount.value = recipe_data.length;
  }
});

const konto = () => {
  const recipe_data = JSON.parse(localStorage.getItem('recipe'));
  if (recipe_data) {
    ingredientCount.value = recipe_data.length;
  }
}

const currentRoute = computed(() => router.currentRoute.value);

const updateItems = (q) => {
  
  const category = currentRoute.value.query.category;

  router.push({ 
    name: 'Search', 
    query: { 
      category,
      q, 
    }
  });
}
</script>