<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}

#category-container {
  max-width: 450px;
}
</style>


<template>
 
    <v-container class="mt-5 overflow-y-auto" id="category-container" max-height="400px">

      <v-row dense justify="center">
        <v-col
          v-for="card in cards"
          :key="card.title"
          :cols="card.flex"
        >
          <v-card @click="goToCategory(card.slug)" :id="card.slug === 'vegetables' ? 'categoryCard' : ''">
            <v-img
              :src="card.src"
              class="align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="200px"
              cover
            >
              <v-card-title class="text-white text-body-2 text-wrap" v-text="card.title"></v-card-title>
            </v-img>

          </v-card>
        </v-col>
      </v-row>

    </v-container>


    <v-dialog
      max-width="400"
      v-model="welcomeModalVisible"   
      persistent
    >
        <v-card
          title="Welcome to Juan Nutrisyon!🌱"
        >

            <div class="px-5 text-body-1">
              <div>
              Your personal nutrition companion to help you make informed food choices—without guilt or fear.
              </div>

              <div class="mt-5">
              ✅ Search for foods and instantly view their nutrient content.
              </div>

              <div>
              ✅ Build recipes and get a full breakdown of combined nutrients.
              </div>

              <div>
              ✅ Track your daily intake and find out if you're meeting your nutritional goals.
              </div>

              <div class="mt-4">
              ✨ Remember: Your body is resilient, and all foods can have a place in a balanced diet. Focus on eating more <strong>whole foods</strong>, <strong>fiber</strong>, and <strong>essential nutrients</strong>, but also enjoy treats in moderation. You deserve to eat, and no single food defines your health. Moderation, not restriction, is key. 💛
              </div>
            </div>

            <template v-slot:actions>
                <v-btn
                    class="ms-auto"
                    text="Dismiss"
                    @click="closeWelcomeModal"
                ></v-btn>
            </template>
        </v-card>
    </v-dialog>
  
    <Tour 
      :targets="targets" 
      v-if="tourModeEnabled" 
      :isLoading="isLoading" />
</template>


<script setup>
import { ref, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import Tour from '@/components/Tour.vue';

import { auth } from '@/firebase.js';
import { onAuthStateChanged } from "firebase/auth";

import vegetablesImage from '@/assets/images/vegetables.jpg';
import aquaticFoodsImage from '@/assets/images/aquatic-foods.jpg';
import fruitsImage from '@/assets/images/fruits.jpg';
import dairyProductsImage from '@/assets/images/dairy-products.jpg';
import cerealsAndGrainsImage from '@/assets/images/cereals-and-grains.jpg';
import herbsAndSpicesImage from '@/assets/images/herbs-and-spices.jpg';
import legumesNutsSeedsImage from '@/assets/images/legumes-nuts-seeds.jpg';
import meatAndPoultryImage from '@/assets/images/meat-and-poultry.jpg';
import fatsAndOilsImage from '@/assets/images/fats-and-oils.jpg';
import beveragesImage from '@/assets/images/beverages.jpg';
import sugarsAndSweetsImage from '@/assets/images/sugars-and-sweets.jpg';
import preparedAndProcessedImage from '@/assets/images/prepared-and-processed.jpg';
import foragedFoodsImage from '@/assets/images/foraged-foods.jpg';

const router = useRouter();
const welcomeModalVisible = ref(!localStorage.getItem('welcome_done'));
const tourModalVisible = ref(true);

const tourModeEnabled = inject("tourModeEnabled");

const isLoading = ref(false);

const cards = ref([
  { id: 2, slug: 'vegetables', title: 'Vegetables', src: vegetablesImage, flex: 12 },
  { id: 4, slug: 'aquatic-foods', title: 'Aquatic Foods', src: aquaticFoodsImage, flex: 6 },
  { id: 4, slug: 'meat-and-poultry', title: 'Meat and Poultry', src: meatAndPoultryImage, flex: 6 },
  { id: 7, slug: 'legumes-nuts-and-seeds', title: 'Legumes, nuts, and seeds', src: legumesNutsSeedsImage, flex: 6 },
  { id: 8, slug: 'fats-and-oils', title: 'Fats and Oils', src: fatsAndOilsImage, flex: 6 },
  { id: 3, slug: 'fruits', title: 'Fruits', src: fruitsImage, flex: 6 },
  { id: 1, slug: 'cereals-and-grains', title: 'Cereals and Grains', src: cerealsAndGrainsImage, flex: 6 },
  { id: 6, slug: 'dairy-products', title: 'Dairy Products', src: dairyProductsImage, flex: 6 },
  { id: 11, slug: 'herbs-and-spices', title: 'Herbs and Spices', src: herbsAndSpicesImage, flex: 6 },
  { id: 10, slug: 'beverages', title: 'Beverages', src: beveragesImage, flex: 6 },
  { id: 12, slug: 'prepared-and-processed', title: 'Prepared and Processed', src: preparedAndProcessedImage, flex: 6 },
  { id: 9, slug: 'sugars-and-sweets', title: 'Sugars and Sweets', src: sugarsAndSweetsImage, flex: 6 },
  { id: 9, slug: 'foraged-foods', title: 'Foraged Foods', src: foragedFoodsImage, flex: 6 },
]);

const targets = ref([
  {
    target: "#searchButton",
    description: "Click on this to start searching for a food.",
  },

  
  {
    target: "#helpButton",
    description: "Click on this if you're lost or if you want to know more info about this app.",
  },

  
  {
    target: "#dietAnalysisButton",
    description: "Click on this to quickly go to the diet analysis page. You can click on the 'Analyze' button on a food's page to add foods to this page.",
  },

  {
    target: "#recipeAnalysisButton",
    description: "Click on this to quickly go to the recipe analysis page. You can click on the 'Add to recipe' button on a food's page to add foods to this page.",
  }
  
]);

const updateTargets = (new_targets) => {
  targets.value = targets.value.concat(new_targets);
}

onAuthStateChanged(auth, (user) => {
  if (user) {
 
    updateTargets([
      {
        target: "#logoutButton",
        description: "Click on this to logout.",
      },
    ]);
  } else {
    updateTargets([
      {
        target: "#loginButton",
        description: "Click on this to login or create a Juan Nutrisyon account. With an account, you can contribute food labels and save recipes for future reference and for other people to view as well.",
      },
    ]);
  }

  updateTargets([
    {
      target: "#appIcon",
      description: "Click on this if you want to go back to the home page"
    },

    {
      target: "#categoryCard",
      description: "Click this to list foods of a specific food category"
    }
  ]);

});


const goToCategory = (slug) => {
  router.push(`/search?category=${slug}`);
};

const closeWelcomeModal = () => {
  welcomeModalVisible.value = false;
  localStorage.setItem('welcome_done', 'yes');
};

//
const steps = ref([
  { id: 1, target: "#btn-1", tooltipText: "Click this button to start" },
  { id: 2, target: "#btn-2", tooltipText: "This button does something important" },
  { id: 3, target: "#input-1", tooltipText: "Enter your details here" },
]);

const stepIndex = ref(0);
const isOnboarding = ref(true);

// Computed Property for Current Step
const currentStep = computed(() => steps.value[stepIndex.value]);

// Get Activator for Tooltip (Ensures it attaches to the correct element)
const getActivator = computed(() => {
  return document.querySelector(currentStep.value.target);
});

// Step Navigation
const nextStep = () => {
  if (stepIndex.value < steps.value.length - 1) {
    stepIndex.value++;
  } else {
    isOnboarding.value = false;
  }
};

const prevStep = () => {
  if (stepIndex.value > 0) {
    stepIndex.value--;
  }
};
</script>
