<template>
  <router-view 
    @update-ingredient-count-child="updateIngredientCountChild" 
    @update-ingredient-serving-size-child="updateIngredientServingSizeChild"
    @update-ingredient-serving-count-child="updateIngredientServingCountChild"
    @update-analyze-count-child="updateAnalyzeCountChild"
    @update-analyze-serving-size-child="updateAnalyzeServingSizeChild" />
  <Loader />
</template>

<script setup>
import { ref } from 'vue';
import Loader from '@/components/Loader.vue';

const emit = defineEmits(['update-ingredient-count']);

// updates the ingredient count in the app bar
const updateIngredientCountChild = () => {
  console.log('HAZAM');
  emit('update-ingredient-count');
}

// updates the analyze count in the app bar
const updateAnalyzeCountChild = () => {
  emit('update-analyze-count');
}

// update the serving size for a recipe ingredient
const updateIngredientServingSizeChild = () => {
  console.log('update serving size child!');
  emit('update-serving-size');
}

// update the serving count for a recipe
const updateIngredientServingCountChild = (servingCount) => {
  console.log('update serving count child!', servingCount);
  emit('update-serving-count', servingCount);
}


</script>