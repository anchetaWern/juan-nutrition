<template>
    <v-dialog
        max-width="400"
        v-model="tourModalVisible" 
        style="z-index: 10001;" 
        scrim="transparent"
    >
        <v-card
            :title="targets[currentTargetIndex].title"
        >
            <div class="px-5 text-body-1">
                <div class="my-4">
                {{ targets[currentTargetIndex].description }}
                </div>
            </div>

            <template v-slot:actions>
                <v-btn
                    v-if="targets.length === 1 || targets.length === currentTargetIndex + 1"
                    class="ms-auto"
                    text="Close"
                    @click="closeTourModal"
                ></v-btn>

                <v-btn
                    v-if="targets.length > 1 && targets.length != currentTargetIndex + 1"
                    class="ms-auto"
                    text="Next"
                    @click="nextTourModal"
                ></v-btn>
            </template>

        </v-card>

    </v-dialog>

    
    <div class="overlay-container" v-if="tourModalVisible && overlayStyles[currentTargetIndex]">
        <div class="overlay" :style="overlayStyles[currentTargetIndex].top"></div>
        <div class="overlay" :style="overlayStyles[currentTargetIndex].bottom"></div>
        <div class="overlay" :style="overlayStyles[currentTargetIndex].left"></div>
        <div class="overlay" :style="overlayStyles[currentTargetIndex].right"></div>
    </div>
  
</template>

<script setup>
import { ref, onMounted, watchEffect, watch } from 'vue';

const tourModalVisible = ref(true);

const overlayStyles = ref([]);

const currentTargetIndex = ref(0);

const closeTourModal = () => {
    tourModalVisible.value = false;
}

const nextTourModal = () => {
    console.log('next');
    currentTargetIndex.value = currentTargetIndex.value + 1;
}

const props = defineProps({
    
    targets: {
        type: Array, // [{title, description, target}]
        required: true,
    },

    isLoading: {
        type: Boolean,
        required: true,
        default: true,
    }
});

// { top: {}, bottom: {}, left: {}, right: {} }
const updateOverlayStyles = () => {

    props.targets.forEach((item) => {

        let targetEl = document.querySelector(`${item.target}`);
        
        if (!targetEl) return; // Wait until the element is available

        let rect = targetEl.getBoundingClientRect();
        let padding = 4;

        overlayStyles.value.push({
            top: {
                top: "0",
                left: "0",
                width: "100%",
                height: `${rect.top - padding}px`,
            },
            bottom: {
                top: `${rect.bottom + padding}px`,
                left: "0",
                width: "100%",
                height: `calc(100% - ${rect.bottom + padding}px)`,
            },
            left: {
                top: `${rect.top - padding}px`,
                left: "0",
                width: `${rect.left - padding}px`,
                height: `${rect.height + padding * 2}px`,
            },
            right: {
                top: `${rect.top - padding}px`,
                left: `${rect.right + padding}px`,
                width: `calc(100% - ${rect.right + padding}px)`,
                height: `${rect.height + padding * 2}px`,
            }
        });
    
    });
};


onMounted(() => {
    setTimeout(() => {
        if (props.isLoading === false) {
            updateOverlayStyles();
        }
        
    }, 100);
});


watch(props.isLoading, (newIsLoading) => {
  if (newIsLoading === false) {
    console.log('not loading..')
    updateOverlayStyles();
  } else {
      console.log('loading');
  }
});

watch(() => props.isLoading, (newValue, oldValue) => {
  if (newValue === false) {
    console.log('not loading..')
    updateOverlayStyles();
  } else {
      console.log('loading');
  }
});
</script>

<style>
.overlay {
  position: absolute;
  background: rgba(0, 0, 0, 0.7); 
}

.overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none; /* Prevents blocking interactions */
  z-index: 9999;
}
</style>