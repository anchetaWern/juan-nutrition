<template>
  <v-app-bar flat>
    <v-app-bar-title>
      <a href="/" style="color: #333;">
        <img :src="logo" alt="juan nutrisyon logo" style="width:150px;" id="appIcon" />
      </a>
    </v-app-bar-title>

    <template v-slot:append>  
      <v-btn size="x-small" icon="mdi-login" @click="goToLogin" v-if="!loggedInUser" id="loginButton"></v-btn>

      <v-btn size="x-small" icon="mdi-logout" @click="logoutUser" v-if="loggedInUser" id="logoutButton"></v-btn>

      <v-badge
        v-if="ingredientCount > 0"
        :content="ingredientCount"
        overlap
        color="success"
      >
        <v-btn size="x-small" icon="mdi-chef-hat" @click="goToRecipe" id="recipeAnalysisButton"></v-btn>
      </v-badge>

      <v-badge
        v-if="analyzeCount > 0"
        :content="analyzeCount"
        overlap
        color="success"
      >
        <v-btn size="x-small" icon="mdi-chart-box" @click="goToAnalysis" id="dietAnalysisButton"></v-btn>
      </v-badge>

      <v-btn v-if="ingredientCount == 0" size="x-small" icon="mdi-chef-hat" @click="goToRecipe" id="recipeAnalysisButton"></v-btn>
      <v-btn v-if="analyzeCount == 0" size="x-small" icon="mdi-chart-box" @click="goToAnalysis" id="dietAnalysisButton"></v-btn>
      

      <v-btn size="x-small" icon="mdi-help" @click="helpDialog = true" id="helpButton"></v-btn>
      <v-btn size="x-small" icon="mdi-magnify" @click="searchDialog = true" id="searchButton"></v-btn>
    </template>    

  </v-app-bar>

  <v-dialog
    v-model="searchDialog"
    width="300"
  >
    <v-card>
      <v-text-field
        hide-details="auto"
        label="What are you looking for?"
        placeholder="Type the name of food"
        v-model="query"
        autofocus
      >
       
      </v-text-field>

      <v-btn color="primary" block @click="search" rounded="0" v-if="!tourModeEnabled">
        Search
      </v-btn>
     
      <v-tooltip location="bottom" :model-value="true" class="custom-tooltip" v-if="tourModeEnabled">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" color="primary" block @click="search" rounded="0">
            Search
          </v-btn>
        </template>

        <div>
        Type in the name of the food you’re looking for, or the vitamins and minerals you want (eg. high in vitamin c, high protein, low carbohydrates) then click on the ‘search’ button.
        </div>
      </v-tooltip>
    
    </v-card>

  </v-dialog>

  <v-dialog
    v-model="helpDialog"
    width="auto"
    max-width="350px"
  >
    <template v-slot:default="{ isActive }">
      <v-card title="Help">
        <template v-slot:text>
          <h3 class="text-subtitle-1 font-weight-bold">Tour</h3> 
          Click the button below on any page to start a tour of the page. <v-btn class="mt-2" color="primary" @click="enableTourMode" block>Start Tour</v-btn>

          <h3 class="mt-3 text-subtitle-1 font-weight-bold">How to use</h3>
          This app has three main features: <br>
          <ul class="pt-1 pl-5">
            <li>
              Searching and viewing nutrient information of foods. 
            </li>
            <li>
              Diet analysis.
            </li>
            <li>
              Recipe analysis.
            </li>
          </ul>
          <br>
          To view food data, you can click on the magnifying glass icon to begin searching. Just type in what you're looking for (eg. <code>Rambutan</code>, <code>high protein</code>, <code>carbohydrates<=2g</code>, <code>high iron</code>, <code>high vitamin c</code>). 
          <br><br>You can click on any of the food categories in the homepage. Note that triggering search while viewing a category will limit the search results to the current category. Be sure to navigate to the homepage before you initiate search if you don't want this behavior.
          <br><br>Results are sorted from smallest nutrition value to the largest. 
          <br><br>Only 10 foods are loaded per page. You can click the left and right arrows at the bottom of each page to navigate through the available pages.

          <br><br>
          To <a href="/analyze">analyze your diet</a>, search for the foods you ate for a day and click on the "Analyze" button. Repeat this step for every food you ate. Once done, click on the graph icon on the top portion of the screen then adjust the serving sizes for each food.<br>
          The summary section is where all the most important nutrients to watch out for is displayed. <br>

          <br>
          You can use the <a href="/recipe">recipe analysis</a> tool to analyze the nutrient content of a recipe. Recipe analysis works the same way as diet analysis: search for the individual ingredients and add them to a recipe. 
          You will then be able to view the nutrient content of the recipe.
          You can also save your recipe for other users to view and modify.  

          <br>
          <br>
          <h3 class="text-subtitle-1 font-weight-bold">Sources & References</h3>
          Below are the sources used for nutrition facts, diet analysis, recipe analysis assessments, daily values, nutrient claims, food weights, local food names in this app:
          <ul class="ml-3">
            <li>Department of Science and Technology-Food and Nutrition Research Institute (DOST-FNRI). 2022. Philippine Food Composition Table (PhilFCT) Online Database. iFNRI Website. Retrieved June-08-2024, from <a href="http://i.fnri.dost.gov.ph/fct/library" target="_blank">http://i.fnri.dost.gov.ph/fct/library</a></li>
            <li>U.S. Department of Agriculture, Agricultural Research Service, Beltsville Human Nutrition Research Center. FoodData Central. [Internet]. [cited February 2025]. Available from <a href="https://fdc.nal.usda.gov/" target="_blank">https://fdc.nal.usda.gov/</a>.</li>
            
            <li>Food and Nutrition Research Institute of the Department of Science and Technology (FNRI-DOST) - <a href="https://www.fnri.dost.gov.ph/images/images/news/PDRI-2018.pdf" target="_blank">Philippine Dietary Reference Intakes 2015</a></li>
            <li>U.S. Food & Drug Administration - <a href="https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels" target="_blank">Daily Value on the Nutrition and Supplement Facts Labels</a></li>

            <li>Food and Agriculture Organization - <a href="https://www.fao.org/ag/humannutrition/32444-09f5545b8abe9a0c3baf01a4502ac36e4.pdf" target="_blank">Guidelines for use of nutrition and health claims.</a></li>

            <li>Bureau of Fisheries and Aquatic Resources - <a href="https://www.bfar.da.gov.ph/market-development-services/fish-and-fishery-product-price-monitoring-service/" target="_blank">Fish and Fishery Product Price Monitoring Service</a></li>
          
            <li>Department of Agriculture - <a href="https://www.da.gov.ph/price-monitoring/" target="_blank">Price monitoring</a></li>

            <li>
            Local food names sources: <a href="https://www.facebook.com/LocalFoodHeritagePH" target="_blank">Lokalpedia</a>,
            <a href="https://featrmedia.com/" target="_blank">Featr</a>, 
            <a href="https://www.gmanetwork.com/gtv/magazine/biyahe_ni_drew/home" target="_blank">Biyahe ni Drew</a>, 
            <a href="https://www.gmanetwork.com/entertainment/tv/pinas_sarap_full_episodes/home/" target="_blank">Pinas Sarap</a>, 
            <a href="https://www.facebook.com/kapusomojessicasoho/" target="_blank">Kapuso mo Jessica Soho</a>
            </li>
          </ul>
          
          <br>
          <h3 class="text-subtitle-1 font-weight-bold">Contributing</h3>
          If you want to contribute, <a href="/register">create an account</a> then visit<a href="https://contribute.juanutrisyon.info" target="_blank">contribute.juanutrisyon.info</a>.

        </template>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="ok"
            variant="flat"
            @click="isActive.value = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

</template>
<script setup>
import logo from '@/assets/images/juan-nutrisyon.png';
import { ref, inject } from 'vue';
import { auth } from '@/firebase.js';
import { signOut } from "firebase/auth";
import { createToast } from 'mosha-vue-toastify';
import 'mosha-vue-toastify/dist/style.css';
import { useRouter } from 'vue-router';

// Props
const props = defineProps({
  updateItems: Function,
  ingredientCount: { type: Number, default: 0 },
  analyzeCount: { type: Number, default: 1 },
  loggedInUser: Object
});

const tourModeEnabled = inject("tourModeEnabled");

// State variables
const query = ref('');
const searchDialog = ref(false);
const helpDialog = ref(false);

const router = useRouter();

// Functions
const search = () => {
  searchDialog.value = false;
  props.updateItems(query.value);
  query.value = '';
};

const enableTourMode = () => {
  tourModeEnabled.value = 'yes';
  helpDialog.value = false;
}

const goToLogin = () => router.push('/login');
const goToRecipe = () => router.push('/recipe');
const goToAnalysis = () => router.push('/analyze');

const logoutUser = async () => {
  try {
    await signOut(auth);
    createToast({ title: 'Logout successful' }, { type: 'success', position: 'bottom-right' });
  } catch (error) {
    console.error("Error logging out:", error.message);
  }
};
</script>


<style>
.custom-tooltip .v-overlay__content {
  background-color: #fff !important; /* Custom background */
  color: #000 !important; /* Custom text color */
  font-weight: bold;
  border-radius: 8px;
  padding: 8px;
}
</style>