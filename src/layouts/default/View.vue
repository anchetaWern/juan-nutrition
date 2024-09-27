<template>
  <router-view @update-ingredient-count-child="updateIngredientCountChild" />
  <Loader />
</template>

<script setup>
import { ref } from 'vue';
import Loader from '@/components/Loader.vue';

const emit = defineEmits(['update-ingredient-count']);

const updateIngredientCountChild = () => {
  emit('update-ingredient-count');
}
</script>