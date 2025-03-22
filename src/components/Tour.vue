<template>
    <div>

        <v-dialog
            max-width="300"
            v-model="tourModalVisible" 
            style="z-index: 10001;" 
            scrim="transparent"
            :content-class="position"
            scroll-strategy="none"
        >
            <v-card
                :title="targets[currentTargetIndex].title"
            >
                <v-btn icon="$close" size="small" variant="text" @click="tourModalVisible = false"></v-btn>

                <div class="px-4 text-body-2">
                    <div class="my-4">
                    {{ targets[currentTargetIndex].description }}
                    </div>
                </div>

                <template v-slot:actions>
                    <v-btn
                        size="small"
                        v-if="targets.length > 1 && currentTargetIndex > 0"
                        text="Prev"
                        @click="prevTourModal"
                    ></v-btn>

                    <v-btn
                        size="small"
                        v-if="targets.length === 1 || targets.length === currentTargetIndex + 1"
                        class="ms-auto"
                        text="Finish Tour"
                        @click="closeTourModal"
                    ></v-btn>

                    <v-btn
                        size="small"
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
            <div class="overlay":style="overlayStyles[currentTargetIndex].left"></div>
            <div class="overlay" :style="overlayStyles[currentTargetIndex].right"></div>
        </div>

    </div>
  
</template>

<script setup>
import { ref, onMounted, watchEffect, watch, nextTick, inject } from 'vue';

const tourModalVisible = ref(true);

const overlayStyles = ref([]);

const currentTargetIndex = ref(0);

const position = ref('bottom');

const updateTourMode = inject("updateTourMode");

const closeTourModal = () => {
    tourModalVisible.value = false;
    updateTourMode(false);
}


const nextTourModal = async () => {
    
    const elementId = props.targets[currentTargetIndex.value + 1]?.target;
    if (elementId) {
       
        let targetEl = document.querySelector(`${elementId}`);

        const rect = targetEl.getBoundingClientRect();
        const offset = 120; // Add extra space to avoid overlap with dialog

        const scrollPosition = window.scrollY + rect.top - (window.innerHeight / 2) + offset;

        window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
        });

        await new Promise((resolve) => setTimeout(resolve, 300));
       
        updateOverlayStyles(elementId);
    }

    const targetPosition = props.targets[currentTargetIndex.value + 1]?.position;
    if (targetPosition) {
        position.value = targetPosition;
    }

    currentTargetIndex.value = currentTargetIndex.value + 1;
}

const prevTourModal = async () => {
   
    const elementId = props.targets[currentTargetIndex.value - 1]?.target;
    if (elementId) {
        
        let targetEl = document.querySelector(`${elementId}`);

        const rect = targetEl.getBoundingClientRect();
        const offset = 120; // Add extra space to avoid overlap with dialog

        const scrollPosition = window.scrollY + rect.top - (window.innerHeight / 2) + offset;

        window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
        });

        await new Promise((resolve) => setTimeout(resolve, 300));
       
        updateOverlayStyles(elementId);
    }

    const targetPosition = props.targets[currentTargetIndex.value - 1]?.position;
    if (targetPosition) {
        position.value = targetPosition;
    }

    currentTargetIndex.value = currentTargetIndex.value - 1;
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
    },
});


const isElementInViewport = (rect) => {
    const buffer = 20; 
    const halfViewportHeight = window.innerHeight / 2;

    return (
        rect.top >= 0 - buffer && // Not above the top
        rect.bottom <= halfViewportHeight + buffer // Not below half of the viewport
    );
};

const scrollToElement = (targetEl) => {
    return new Promise((resolve) => {
        targetEl.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        // Wait for the scroll to finish
        setTimeout(resolve, 300); // Give enough time for the scroll to complete
    });
};


const updateOverlayStyles = async (target) => {

    let targetEl = document.querySelector(`${target}`);
    
    if (!targetEl) return; // Wait until the element is available

    let padding = 4;
    
    let rect = targetEl.getBoundingClientRect();
    let isInViewport = isElementInViewport(rect);

    // Scroll to element if it's out of view
    if (!isInViewport) {
        await scrollToElement(targetEl);
        rect = targetEl.getBoundingClientRect(); // Recalculate position after scroll
    }

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

};


onMounted(() => {
    setTimeout(() => {
        if (props.isLoading === false) {
            updateOverlayStyles(props.targets[0].target);
        }
        
    }, 100);
});


watch(() => props.isLoading, (newValue, oldValue) => {
  if (newValue === false) {
    updateOverlayStyles(props.targets[0].target);
  } 
});
</script>

<style>
.overlay {
  position: absolute;
  background: rgba(0, 0, 0, 0.7); 
  pointer-events: none;
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

.top {
  position: absolute !important;
  top: 20px !important;
  left: 50% !important;
  transform: translateX(-50%);
  margin: 0 !important;
}

.bottom {
  position: absolute !important;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%);
  margin: 0 !important;
}
</style>