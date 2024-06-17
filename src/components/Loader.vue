<template>
    <v-container fluid class="d-flex justify-center align-center fill-height" v-if="loading">
        <div class="text-center">
            <v-progress-circular
                color="primary"
                indeterminate
            ></v-progress-circular>
            <div>Loading...</div>
        </div>
    </v-container>
</template>

<script>
import { computed } from 'vue';
import { useLoadingStore } from '@/stores/loading'; 

export default {
  setup() {
    const loadingStore = useLoadingStore();
    const loading = computed(() => loadingStore.loading);

    return { loading };
  },
};
</script>