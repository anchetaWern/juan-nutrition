<template>
  <v-app>
    <default-bar 
      :updateItems="updateItems" 
      :ingredientCount="ingredientCount"
      :analyzeCount="analyzeCount"
      :loggedInUser="loggedInUser"
    />

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
import { auth } from '@/firebase.js';
import { onAuthStateChanged } from "firebase/auth";

import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'

const router = useRouter();

const ingredientCount = ref(0);
const analyzeCount = ref(0);

const loggedInUser = ref(null);

onAuthStateChanged(auth, (user) => {
  if (user) {
    loggedInUser.value = user;
  } else {
    loggedInUser.value = null;
  }
});

onMounted(() => {
  const recipe_data = JSON.parse(sessionStorage.getItem('recipe'));
  const recipe_serving_sizes = JSON.parse(sessionStorage.getItem('recipe_serving_sizes'));
  if (recipe_data && recipe_serving_sizes) {
    ingredientCount.value = recipe_data.length;
  }

  const analyze_data = JSON.parse(sessionStorage.getItem('analyze'));
  if (analyze_data) {
    analyzeCount.value = analyze_data.length;
  }
});

const updateIngredientCount = () => {
  const recipe_data = JSON.parse(sessionStorage.getItem('recipe'));
  const recipe_serving_sizes = JSON.parse(sessionStorage.getItem('recipe_serving_sizes'));

  if (recipe_data && recipe_serving_sizes) {
    ingredientCount.value = recipe_data.length;
  } else {
    ingredientCount.value = 0;
  }
}

const updateServingSize = () => {
  const recipe_serving_sizes = JSON.parse(sessionStorage.getItem('recipe_serving_sizes'));
}

const updateServingCount = (servingCount) => {

  sessionStorage.setItem('serving_count', servingCount);
}

const updateAnalyzeCount = () => {
  const analyze_data = JSON.parse(sessionStorage.getItem('analyze'));
  if (analyze_data) {
    analyzeCount.value = analyze_data.length;
  } else {
    analyzeCount.value = 0;
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