<template>
  <v-app>
    <default-bar 
      :updateItems="updateItems" 
      :ingredientCount="ingredientCount"
      :analyzeCount="analyzeCount" />

    <default-view 
      :items="items" 
      @update-ingredient-count="updateIngredientCount" 
      @update-serving-size="updateServingSize"
      @update-serving-count="updateServingCount"
      @update-analyze-count="updateAnalyzeCount" />
  </v-app>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'

import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'

const router = useRouter();

const ingredientCount = ref(0);
const analyzeCount = ref(0);

onMounted(() => {
  const recipe_data = JSON.parse(localStorage.getItem('recipe'));
  const recipe_serving_sizes = JSON.parse(localStorage.getItem('recipe_serving_sizes'));
  if (recipe_data && recipe_serving_sizes) {
    ingredientCount.value = recipe_data.length;
  }

  const analyze_data = JSON.parse(localStorage.getItem('analyze'));
  if (analyze_data) {
    analyzeCount.value = analyze_data.length;
  }
});

const updateIngredientCount = () => {
  const recipe_data = JSON.parse(localStorage.getItem('recipe'));
  const recipe_serving_sizes = JSON.parse(localStorage.getItem('recipe_serving_sizes'));

  if (recipe_data && recipe_serving_sizes) {
    ingredientCount.value = recipe_data.length;
  }
}

const updateServingSize = () => {
  const recipe_serving_sizes = JSON.parse(localStorage.getItem('recipe_serving_sizes'));
}

const updateServingCount = (servingCount) => {

  localStorage.setItem('serving_count', servingCount);
}

const updateAnalyzeCount = () => {
  const analyze_data = JSON.parse(localStorage.getItem('analyze'));
  if (analyze_data) {
    analyzeCount.value = analyze_data.length;
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