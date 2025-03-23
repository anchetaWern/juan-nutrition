<template>
 
    <v-container class="mt-5" id="recipe-container">
    
      <div class="text-h6 mb-2">Create Recipe</div>

      <v-alert 
        v-if="!recipe || recipe.length === 0"
        density="compact"
        type="warning"
        variant="outlined"
      >
        You haven't added any foods yet. You can click on the 'Add to recipe' button on a food page to add it. 
      </v-alert>

      <div v-if="recipe && recipe.length > 0">
        
        <div id="recipe-foods" v-for="food in recipe" :key="food.description_slug" class="mb-3">
          <FoodCard 
            :food="food" 
            :removeFood="removeFood" 
            :initialServingSize="servingSizes[food.description_slug]"
            @update-serving-size="updateServingSize"
            :openModifyServingSizeModal="openModifyServingSizeModal"
            :key="food_card_key" />
        </div>

        <v-text-field
          id="serving-count"
          v-model="servingCount"
          @input="onUpdateServingCount"
          label="Number of servings"
        ></v-text-field>

        <div v-if="loggedInUser">

          <v-text-field
            id="recipe-name"
            v-model="recipeName"
            label="Recipe name"
          ></v-text-field>

          <v-file-input 
            id="recipe-image"
            clearable 
            @click:clear="clearImage"
            label="Recipe image" 
            @change="previewImage('captured_title_image_data', 'title_image_file_input', $event)" 
            ref="title_image_file_input">
          </v-file-input>

          <img id="recipe-image-preview" :src="captured_title_image_data" class="img" />

          <v-btn id="save-recipe" color="primary" block @click="saveRecipe" rounded="0" :disabled="saveRecipeDisabled">Save Recipe</v-btn>
        </div>

      </div>

      <v-dialog
          v-model="modifyServingSizeDialog"
          width="300"
      >
          <v-card title="Modify Serving Size">
              <div class="px-5 py-2">
                  <div v-if="custom_serving_sizes">
                  
                      <v-radio-group v-model="selected_custom_serving">
                        <v-radio 
                          :label="cs.name" 
                          :value="cs.volume_in_ml ? convertWeight(current_food.density.density, cs.volume_in_ml): cs.weight" 
                          v-for="cs in custom_serving_sizes">
                        </v-radio>
                      </v-radio-group>

                      <div class="text-medium-emphasis">Quantity</div>
                      <v-number-input
                          control-variant="split"
                          inset
                          v-model="selected_serving_qty"
                      ></v-number-input>
                  </div>

                  <div v-if="current_food.custom_serving_size" class="text-body-2 text-medium-emphasis py-1">
                    {{ current_food.custom_serving_size }} = {{ current_food.serving_size }}{{ current_food.serving_size_unit }}
                  </div>

                  <div v-else-if="current_food.serving_size" class="text-body-2 text-medium-emphasis py-1">
                    Original serving size: {{ current_food.serving_size }}{{ current_food.serving_size_unit }}
                  </div>

                  <div v-if="current_food.servings_per_container" class="text-body-2 text-medium-emphasis py-1">
                    Servings per container: {{ current_food.servings_per_container }} 
                  </div>

                  <v-text-field
                      label="Serving size in grams"
                      placeholder="50"
                      v-model="current_food_serving_size"
                  ></v-text-field>

                  <v-btn color="primary" block @click="changeServingSize" rounded="0">Modify serving size</v-btn>
              </div>
          </v-card>

      </v-dialog>


      <v-dialog
          v-model="reportIssueModalVisible"
          width="300"
          max-width="400"
      >
          <v-card title="Report Issue">
              <template v-slot:text>
                  
                  <v-textarea
                      label="Describe your issue"
                      v-model="issueDescription"
                      rows="2"
                  ></v-textarea>

                  <v-btn color="primary" block @click="submitIssue" rounded="0">Submit</v-btn>
              </template>
          </v-card>
      </v-dialog>


    </v-container>

    <div v-if="recipe && recipe.length > 0">

      <v-table>
          <tbody>
              <tr>
                  <td id="serving-size-mirror" class="text-grey-darken-3">
                      Serving Size: {{ serving_size }}g
                  </td>
              </tr>
              <tr>
                  <td id="serving-count-mirror" class="text-grey-darken-3">
                      Total Servings: {{ servingCount }}
                  </td>
              </tr>

              <tr>
                  <td id="calories-per-serving" class="text-grey-darken-3">
                      Calories per serving: <span id="calories">{{ wholeNumber(recipe_calories_per_serving) }}kcal</span> / <span id="calories-required">2000kcal</span> <span id="calories-percent-of-required">({{ formatNumber(calculatePercentage(amountPerContainer(recipe_calories_per_serving, servingCount, displayValuesPerContainer, serving_size, serving_size, servingCount), 2000)) }}%)</span>
                      <v-progress-linear 
                        id="calories-progress"
                        class="mt-1"
                        :model-value="calculatePercentage(amountPerContainer(recipe_calories_per_serving, servingCount, true, serving_size, serving_size, servingCount), 2000)" 
                        bg-color="grey-darken-3" 
                        color="deep-purple-lighten-2">
                      </v-progress-linear>
                  </td>
              </tr>

              <tr>
                  <td id="total-calories" class="text-grey-darken-3">
                      Total Calories: {{ wholeNumber(recipe_total_calories) }}kcal
                  </td>
              </tr>

              <tr>
                  <td id="ingredient-count" class="text-grey-darken-3">
                      Ingredient count: {{ ingredients_count }}
                  </td>
              </tr>

          </tbody>
      </v-table>

      <div class="text-subtitle-1 mb-2">Estimated nutrients per serving</div>

      <div id="macros-section" class="mt-3" v-if="macros.length">
        <span class="text-subtitle-2">Macros</span>
        <NutrientsTable 
          v-if="macros"
          :nutrients="macros" 
          servingsPerContainer="1" 
          displayValuesPerContainer="false"
          :recommended_daily_values="recommended_daily_values"
          :newServingSize="newServingSize"
          :newServingCount="newServingCount"
          :getValueColor="getValueColor" />
      </div>


      <div id="vitamins-section" class="mt-3" v-if="vitamins.length">
        <span class="text-subtitle-2">Vitamins</span>
        <NutrientsTable 
          :nutrients="vitamins" 
          servingsPerContainer="1" 
          displayValuesPerContainer="false"
          :recommended_daily_values="recommended_daily_values"
          :newServingSize="newServingSize"
          :newServingCount="newServingCount"
          :getValueColor="getValueColor" />
      </div>

      <div id="minerals-section" class="mt-3" v-if="minerals.length">
        <span class="text-subtitle-2">Minerals</span>
        <NutrientsTable 
          :nutrients="minerals" 
          servingsPerContainer="1" 
          displayValuesPerContainer="false"
          :recommended_daily_values="recommended_daily_values"
          :newServingSize="newServingSize"
          :newServingCount="newServingCount"
          :getValueColor="getValueColor" />
      </div>

      <div id="other-nutrients-section" class="mt-3" v-if="others.length">
        <span class="text-subtitle-2">Others</span>
        <NutrientsTable 
          :nutrients="others" 
          servingsPerContainer="1" 
          displayValuesPerContainer="false"
          :recommended_daily_values="recommended_daily_values"
          :newServingSize="newServingSize"
          :newServingCount="newServingCount"
          :getValueColor="getValueColor" />
      </div>


      <div class="mt-5 text-center">
        <v-btn id="report-issue" size="x-small" variant="text" @click="openReportIssueModal">
        Report Issue
        </v-btn>
      </div>

    </div>

    <Tour 
      :targets="targets" 
      :isLoading="isLoading"
      v-if="tourModeEnabled"
    />
    

</template>


<style>
.img {
  max-width: 100%;
}
</style>

<script setup>
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import FoodCard from '@/components/FoodCard.vue';
import NutrientsTable from '@/components/NutrientsTable.vue'
import { ref, watch, onMounted, nextTick, defineEmits, inject } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

import Compressor from 'compressorjs'

import { createToast } from 'mosha-vue-toastify'
import 'mosha-vue-toastify/dist/style.css'

import { 
    aggregateNutrients,
    getMacros,
    getVitamins,
    getMinerals,
    getOthers,
    modifyServingSize,
    amountPerContainer,
} from '@/helpers/Nutrients';

import { calculatePercentage, wholeNumber, formatNumber } from '@/helpers/Numbers';


import { auth } from '@/firebase.js';
import { onAuthStateChanged } from "firebase/auth";
import Tour from '@/components/Tour.vue';


const router = useRouter();

const recipe_data = JSON.parse(sessionStorage.getItem('recipe'));
const recipe = ref(recipe_data);

const servingCount = ref(1);

const recipe_name = sessionStorage.getItem('recipe_name');
const recipeName = ref(recipe_name);

const macros = ref([]);
const vitamins = ref(null);
const minerals = ref(null);
const others = ref(null);

const recipe_nutrients = ref(null);

const newServingSize = ref(null);
const newServingCount = ref(1);

const loggedInUser = ref(null);

const serving_size = ref(null);

const recipe_calories_per_serving = ref(null);
const recipe_total_calories = ref(null);
const recipe_food_state = ref(null);
const ingredients_count = ref(null);
const ingredients = ref(null);

const API_BASE_URI = import.meta.env.VITE_API_URI;

const saveRecipeDisabled = ref(true);

const reportIssueModalVisible = ref(false);
const issueDescription = ref('');

//

const recipe_serving_sizes_data = JSON.parse(sessionStorage.getItem('recipe_serving_sizes'));
const servingSizes = ref(recipe_serving_sizes_data ? recipe_serving_sizes_data : {});

const current_food_slug = ref(null);
const current_food = ref(null);
const modifyServingSizeDialog = ref(false);

const custom_serving_sizes = ref(null);
const selected_custom_serving = ref(null);
const selected_serving_qty = ref(1);
const captured_title_image_data = ref(null); // replacement
const title_image_file_input = ref(null); // replacement

const custom_servings_ref = ref(null);

const food_card_key = ref(1);

const current_food_serving_size = ref(null); // the serving size set for the food being currently updated
const hasValuesPerContainerToggle = ref(false);

const emit = defineEmits(['update-ingredient-count-child', 'update-ingredient-serving-size-child', 'update-ingredient-serving-count-child']);


let isProgrammaticUpdate = false;

const tourModeEnabled = inject("tourModeEnabled");

const isLoading = ref(false);

const targets = [
  {
    target: '#recipe-foods .food-card:nth-child(1) .food-description',
    description: "This is the name of the food. You can click on this to view the food page."
  },

  {
    target: '#recipe-foods .food-card:nth-child(1) .modify-serving-size',
    description: "Modify the serving size for each food via the text field or by clicking the weighing scale icon."
  },

  {
    target: '#recipe-foods .food-card:nth-child(1) .remove-food',
    description: "Click on this to remove the food from your analysis."
  },

  {
    target: '#serving-count',
    description: 'Enter the estimated number of people that the recipe can feed.',
  },

  // only available when user is logged in
  /*
  {
    target: '#recipe-name',
    description: 'Enter a descriptive name for the recipe.',
  },
  {
    target: '#recipe-image',
    description: 'Upload a photo of the cooked recipe here.',
  },
  {
    target: '#recipe-image-preview',
    description: 'This is the preview of the recipe image.',
  },
  {
    target: '#save-recipe',
    description: 'Click this to save the recipe. This will make it available for other users to search.',
  },
  */
  {
    target: '#serving-size-mirror',
    description: 'This is the total weight of the recipe.',
  },
  {
    target: '#serving-count-mirror',
    description: 'This is the total number of servings.',
  },

  {
    target: '#calories',
    description: 'This is the total amount of calories per serving.',
  },
  {
    target: '#calories-required',
    description: 'This is the daily recommended calorie value.',
  },
  {
    target: '#calories-percent-of-required',
    description: 'This is the percent of the daily recommended value fulfilled by eating the food.',
  },
  {
    target: '#calories-progress',
    description: "This is the visual representation of how much of the daily nutrient value is fulfilled by consuming the food. You want this to be darker for fiber, protein, vitamins and minerals. Lighter for saturated fat, sugar, and cholesterol. Note that these nutrients are not inherently good or bad, we all need fat, sugar, and cholesterol. But it's best to be vigilant about it, especially if you're already trying to manage hypertension or diabetes. Moderation and not total avoidance is always key.",
  },
  {
    target: '#total-calories',
    description: 'This is the total calories provided by the whole recipe.',
  },
  {
    target: '#ingredient-count',
    description: 'This is the total number of ingredients used in the recipe. Note that this is only accurate if the ingredients used are all whole foods. If processed foods were used as ingredients then this will be inaccurate.',
  },
  

  {
    target: '#macros-section',
    description: 'This is the macronutrient section which shows detailed information on the amount of carbohydrates, fats, and protein available in the recipe.',
  },
  {
    target: '#vitamins-section',
    description: 'This is the vitamins section.',
  },
  {
    target: '#minerals-section',
    description: 'This is the minerals section.',
    position: 'top',
  },

  {
    target: '#report-issue',
    description: 'Click on this button to report any issue you notice.',
  },
];

if (recipe_data && Object.keys(servingSizes.value).length === 0) {
  recipe_data.forEach(food => {
    servingSizes.value[food.description_slug] = food.serving_size;
  });
}

const serving_count = sessionStorage.getItem('serving_count');
if (serving_count) {
  servingCount.value = serving_count;
}
//


onAuthStateChanged(auth, (user) => {
  if (user) {
    loggedInUser.value = user;
  } else {
    loggedInUser.value = null;
  }
});

const saveRecipe = async () => {

  const api_key = localStorage.getItem('api_key');
  
  saveRecipeDisabled.value = true;

  if (recipeName.value && servingCount.value && captured_title_image_data.value) {
    
    try {

      const recipe_res = await axios.post(`${API_BASE_URI}/recipe`, { 
        'name': recipeName.value,
        'image': captured_title_image_data.value, 
        'serving_count': servingCount.value,
        'serving_size': serving_size.value,
        'calories': recipe_calories_per_serving.value,
        'ingredients': ingredients.value,
        'nutrients': recipe_nutrients.value,
        'food_state': recipe_food_state.value,
      },
      {
        timeout: 30000,
        headers: {
          'x-api-key': api_key,
        }
      });

      createToast(
          {
              title: 'Recipe Created!',
              description: 'Other users can now search your recipe.'
          }, 
          { type: 'success', position: 'bottom-right' }
      );

      // reset form
      saveRecipeDisabled.value = true;
      recipeName.value = null;
      servingCount.value = null;
      captured_title_image_data.value = null;
      title_image_file_input.value = null;

      sessionStorage.removeItem('recipe');
      sessionStorage.removeItem('recipe_custom_servings');
      sessionStorage.removeItem('recipe_name');
      sessionStorage.removeItem('recipe_serving_sizes');
      sessionStorage.removeItem('serving_count');

      emit('update-ingredient-count-child');

      router.push(`/`);

    } catch (err) {
      console.log('save recipe err: ', err);
      saveRecipeDisabled.value = false;
    }
  } 
}


watch(selected_custom_serving, (new_custom_serving, old_custom_serving) => {
  if (isProgrammaticUpdate) return;
  
  selected_serving_qty.value = 1;
  current_food_serving_size.value = parseFloat(new_custom_serving);  
});

watch(selected_serving_qty, (new_serving_qty, old_serving_qty) => {
  if (isProgrammaticUpdate) return;

  if (selected_custom_serving.value) {
      current_food_serving_size.value = parseFloat(selected_custom_serving.value) * parseInt(new_serving_qty);
  }
});

watch(servingCount, () => {
  refreshRecipe();
});

watch(recipeName, () => {
  refreshRecipe();
});

const recommended_daily_values = ref(null);


function clearImage() {
  captured_title_image_data.value = null;
  title_image_file_input.value = null;

  refreshRecipe();
}

const previewImage = async (name, fileInputName, event) => {
  
  const file = event.target.files[0];
  const optimizedFile = await optimizeImage(file);

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      
      captured_title_image_data.value = e.target.result;

      refreshRecipe();
    };

    reader.readAsDataURL(file);
  } else {
    title_image_file_input.value = null;
    captured_title_image_data.value = null;

    refreshRecipe();
  }

};


async function optimizeImage(blob) {
  return new Promise((resolve, reject) => {
    new Compressor(blob, {
      quality: 0.8,
      width: 1000,

      success(blob_obj) {
        const reader = new FileReader();
        reader.readAsDataURL(blob_obj);

        reader.onload = (event) => {
          const dataURL = event.target.result;
          resolve(dataURL);
        };

        reader.onerror = (error) => {
          reject(error);
        };
      },

      error(error) {
        reject(error);
      }
    });
  });
}


const fetchDailyValues = async () => {
  let consolidated_daily_nutrient_dv = null;

  if (sessionStorage.getItem('consolidated_daily_nutrient_dv')) {
      consolidated_daily_nutrient_dv = JSON.parse(sessionStorage.getItem('consolidated_daily_nutrient_dv'));
  } else {
      const fda_daily_nutrient_values_res = await axios.get(`${API_BASE_URI}/consolidated-recommended-daily-nutrient-intake?gender=male&age=19`);
      consolidated_daily_nutrient_dv = fda_daily_nutrient_values_res.data;
      sessionStorage.setItem('consolidated_daily_nutrient_dv', JSON.stringify(consolidated_daily_nutrient_dv));
  }

  // isLoading.value = false;
  console.log('rapas')

  const fda_daily_nutrient_values_arr = consolidated_daily_nutrient_dv.map((itm) => {
      return {
          [itm.nutrient]: itm.daily_value,
      }
  });
  const fda_daily_nutrient_values = Object.assign({}, ...fda_daily_nutrient_values_arr);
  recommended_daily_values.value = fda_daily_nutrient_values;
}

fetchDailyValues();


const loadCustomServingsData = () => {
  // load custom servings data

  const stored_cs = sessionStorage.getItem('recipe_custom_servings');
  if (stored_cs) {
    custom_servings_ref.value = JSON.parse(stored_cs); 
  }
}

onMounted(loadCustomServingsData);


const openModifyServingSizeModal = (food_slug, custom_servings_category) => {
  
  current_food_slug.value = food_slug;
  const found_food = recipe.value.find(itm => itm.description_slug === food_slug);
  current_food.value = found_food;

  if (custom_servings_category) {
    hasValuesPerContainerToggle.value = false;
    
    const serving_units = custom_servings_category.serving_units.map(itm => {
      return {
        'name': itm.name,
        'weight': itm.weight,
        'unit': itm.weight_unit,
        'volume_in_ml': itm.volume_in_ml,
      }
    })
    .filter((itm) => {
      return itm.volume_in_ml && found_food.density || itm.weight;
    });

    if (serving_units && serving_units.length > 0) {
        custom_serving_sizes.value = serving_units;
    }

    // load corresponding custom serving and fill the field if available
    
    const current_custom_serving = custom_servings_ref.value[food_slug];

    if (current_custom_serving) {
      isProgrammaticUpdate = true;

      const current_serving_size = current_custom_serving.weight * current_custom_serving.qty;
      
      selected_custom_serving.value = current_custom_serving.weight;
      selected_serving_qty.value = current_custom_serving.qty;
      current_food_serving_size.value = current_serving_size; // custom_servings_ref.value[food_slug].weight;

      nextTick(() => {
        isProgrammaticUpdate = false;
      });
      
    }

  } else {
    const current_food = recipe.value.find(itm => itm.description_slug === food_slug);

    if (current_food.servings_per_container > 1) {
      hasValuesPerContainerToggle.value = true;
    }

    const current_serving_size = parseFloat(servingSizes.value[food_slug]);

    custom_serving_sizes.value = null;
    selected_custom_serving.value = current_serving_size;
    selected_serving_qty.value = 1;

    current_food_serving_size.value = current_serving_size;

  }
  
  
  modifyServingSizeDialog.value = true;

}


const getValueColor = (value, daily_limit) => {
  const dv_percent = calculatePercentage(value, daily_limit); 
  
  if (dv_percent > 125) {
    return 'deep-purple-darken-4';

  } else if (dv_percent >= 75 && dv_percent <= 125) {
    return 'deep-purple-lighten-2';
  } 

  return 'deep-purple-lighten-4';
};

function refreshRecipe() {
  
  if (recipeName.value && servingCount.value && captured_title_image_data.value) {
    const recipe_data = JSON.parse(sessionStorage.getItem('recipe'));
    if (recipe_data && recipe_data.length > 1) {
      
      saveRecipeDisabled.value = false;
    } else {
      saveRecipeDisabled.value = true;
    }
    
  } else {
    saveRecipeDisabled.value = true;
  }
  
}


const refreshNutrients = () => {
  const recipe_data = JSON.parse(sessionStorage.getItem('recipe'));
  const recipe_serving_sizes_data = JSON.parse(sessionStorage.getItem('recipe_serving_sizes'));

  if (recipe_data && recipe_data.length) {
    const aggregated_nutrients = aggregateNutrients(recipe_data, recipe_serving_sizes_data, servingCount.value);
    recipe_nutrients.value = aggregated_nutrients;

    macros.value = getMacros(aggregated_nutrients);
    vitamins.value = getVitamins(aggregated_nutrients);
    minerals.value = getMinerals(aggregated_nutrients);
    others.value = getOthers(aggregated_nutrients);
  
    const recipe_ingredients = recipe_data.map((itm) => {
      const original_serving_size = itm.serving_size;
      const serving_size = parseInt(recipe_serving_sizes_data[itm.description_slug]);
      const serving_size_unit = itm.serving_size_unit;
      const food_state = itm.food_state;
      const food_substate = itm.food_substate;
      const original_calories = itm.calories;
      const new_calories = modifyServingSize(original_serving_size, serving_size, itm.calories);
    
      return {
        slug: itm.description_slug,
        original_serving_size,
        serving_size,
        serving_size_unit,
        food_state,
        food_substate,
        original_calories,
        new_calories,
      }
    });

    ingredients.value = recipe_ingredients;

    const total_calories = recipe_ingredients.reduce(
      (accumulator, itm) => accumulator + itm.new_calories,
      0,
    );
    
    recipe_total_calories.value = total_calories;

    const calories_per_serving = total_calories / servingCount.value;       
    recipe_calories_per_serving.value = calories_per_serving;

    const total_ingredients = recipe_ingredients.length;
    ingredients_count.value = total_ingredients;

    const food_states = {};
    recipe_ingredients.forEach((itm) => {
      food_states[itm.food_state] = food_states.hasOwnProperty(itm.food_state) ? food_states[itm.food_state] + 1 : 1; 
    });

    const sorted_by_food_state = Object.keys(food_states).sort(function(a, b){
      return food_states[b] - food_states[a];
    }); // first item is the food state

    recipe_food_state.value = sorted_by_food_state[0];

    const total_weight = recipe_ingredients.reduce(
      (accumulator, itm) => accumulator + itm.serving_size,
      0,
    );

    const weight_per_serving = total_weight / servingCount.value;
    serving_size.value = weight_per_serving; 

  }
          
}

refreshNutrients();


const changeServingSize = () => {
  
  modifyServingSizeDialog.value = false;

  updateServingSize(current_food_slug.value, current_food_serving_size.value);


  food_card_key.value += 1; 


  let stored_custom_servings = {};
  const stored_cs = sessionStorage.getItem('recipe_custom_servings');
  if (stored_cs) {
    stored_custom_servings = JSON.parse(stored_cs);
  }

  stored_custom_servings[current_food_slug.value] = {
    'weight': selected_custom_serving.value,
    'qty': selected_serving_qty.value, 
  }
  
  custom_servings_ref.value = stored_custom_servings;

  sessionStorage.setItem('recipe_custom_servings', JSON.stringify(stored_custom_servings));
}


const removeFood = (slug) => {
  
  const updated_recipe = recipe.value.filter((food) => {
    return food.description_slug !== slug;
  }); 

  sessionStorage.setItem('recipe', JSON.stringify(updated_recipe));

  recipe.value = updated_recipe;   

  delete servingSizes.value[slug];             

  sessionStorage.setItem('recipe_custom_servings', JSON.stringify(servingSizes.value));

  const updated_recipe_serving_sizes = Object.fromEntries(
    Object.entries(servingSizes.value).map(([key, value]) => [key, value])
  );

  sessionStorage.setItem('recipe_serving_sizes', JSON.stringify(updated_recipe_serving_sizes));

  emit('update-ingredient-count-child');

  refreshNutrients();
  refreshRecipe();
}

const updateServingSize = (slug, newServingSize) => {
  servingSizes.value[slug] = newServingSize;
  sessionStorage.setItem('recipe_serving_sizes', JSON.stringify(servingSizes.value));

  emit('update-ingredient-serving-size-child');

  refreshNutrients();
}

const onUpdateServingCount = () => {

  emit('update-ingredient-serving-count-child', servingCount.value); 
  
  refreshNutrients();

  refreshRecipe();
}



const openReportIssueModal = () => {
    reportIssueModalVisible.value = true;
}


const submitIssue = async () => {
  
  const food_urls = recipe.value.map(itm => itm.description_slug);

  if (issueDescription.value.trim()) {

      try {
          await axios.post(`${API_BASE_URI}/report-issue`, 
              { 
                  'page': `recipe`,
                  'params': JSON.stringify(food_urls),
                  'description': issueDescription.value
              }, 
          );

          createToast(
              {
                  title: 'Submitted!',
                  description: "Your issue was submitted. Thank you for your contribution. We really appreciate it!"
              }, 
              { type: 'success', position: 'bottom-right' }
          );

          issueDescription.value = '';
          reportIssueModalVisible.value = false;
          
      } catch (err) {
          console.log('submit issue error: ', err);
      }
  } 
}
</script>