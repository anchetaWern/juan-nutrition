<template>
  <router-view 
    @update-ingredient-count-child="updateIngredientCountChild" 
    @update-serving-size-child="updateServingSizeChild"
    @update-serving-count-child="updateServingCountChild" />
  <Loader />
</template>

<script setup>
import { ref } from 'vue';
import Loader from '@/components/Loader.vue';

const emit = defineEmits(['update-ingredient-count']);

const updateIngredientCountChild = () => {
  emit('update-ingredient-count');
}

const updateServingSizeChild = () => {
  console.log('update serving size child!');
  emit('update-serving-size');
}

const updateServingCountChild = (servingCount) => {
  console.log('update serving count child!', servingCount);
  emit('update-serving-count', servingCount);
}
</script>