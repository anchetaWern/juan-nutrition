<template>
  <router-view @konto-child="kontoChild" />
  <Loader />
</template>

<script setup>
import { ref } from 'vue';
import Loader from '@/components/Loader.vue';

const emit = defineEmits(['konto']);

const kontoChild = () => {
  emit('konto');
}
</script>