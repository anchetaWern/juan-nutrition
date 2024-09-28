<template>
  <v-app>
    <default-bar :updateItems="updateItems" :ingredientCount="ingredientCount" />

    <default-view 
      :items="items" 
      @update-ingredient-count="updateIngredientCount" 
      @update-serving-size="updateServingSize"
      @update-serving-count="updateServingCount" />
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
  const serving_sizes = JSON.parse(localStorage.getItem('serving_sizes'));
  if (recipe_data && serving_sizes) {
    ingredientCount.value = recipe_data.length;
  }
});

const updateIngredientCount = () => {
  const recipe_data = JSON.parse(localStorage.getItem('recipe'));
  const serving_sizes = JSON.parse(localStorage.getItem('serving_sizes'));

  if (recipe_data && serving_sizes) {
    ingredientCount.value = recipe_data.length;
  }
}

const updateServingSize = () => {
  const serving_sizes = JSON.parse(localStorage.getItem('serving_sizes'));
}

const updateServingCount = (servingCount) => {

  localStorage.setItem('serving_count', servingCount);
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