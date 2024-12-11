<template>
 
    <v-container class="mt-5" id="recipe-container">
    
      <div class="text-h6 mb-2">Estimate recipe nutrients</div>

      <v-alert 
        v-if="!recipe || recipe.length === 0"
        density="compact"
        type="warning"
        variant="outlined"
      >
        You haven't added any foods yet. You can click on the 'Add to recipe' button on a food page to add it. 
      </v-alert>

      <div v-if="recipe && recipe.length > 0">
        <v-text-field
          v-model="servingCount"
          @input="onUpdateServingCount"
          label="Number of servings"
        ></v-text-field>

        <div v-for="food in recipe" :key="food.description_slug" class="mb-3">
          <FoodCard 
            :food="food" 
            :removeFood="removeFood" 
            :initialServingSize="servingSizes[food.description_slug]"
            @update-serving-size="updateServingSize"
            :openModifyServingSizeModal="openModifyServingSizeModal"
            :key="food_card_key" />
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

                  <v-btn color="primary" block @click="modifyServingSize" rounded="0">Modify serving size</v-btn>
              </div>
          </v-card>

      </v-dialog>


    </v-container>

    <div v-if="recipe && recipe.length > 0">

      <div class="text-subtitle-1 mb-2">Estimated nutrients per serving</div>

      <div class="mt-3" v-if="macros.length">
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


      <div class="mt-3" v-if="vitamins.length">
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

      <div class="mt-3" v-if="minerals.length">
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

      <div class="mt-3" v-if="others.length">
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

    </div>
    

</template>



<script>
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import FoodCard from '@/components/FoodCard.vue';
import NutrientsTable from '@/components/NutrientsTable.vue'
import { ref, watch, onMounted, nextTick } from 'vue';

import { 
    aggregateNutrients,
    getMacros,
    getVitamins,
    getMinerals,
    getOthers,
} from '@/helpers/Nutrients';

import { calculatePercentage } from '@/helpers/Numbers';

const recipe = ref(null);

const servingCount = ref(1);

const macros = ref([]);
const vitamins = ref(null);
const minerals = ref(null);
const others = ref(null);

const newServingSize = ref(null);
const newServingCount = ref(1);

export default {
    components: {
      FoodCard,  
      NutrientsTable,
      VNumberInput,
    },


    setup(props, { emit }) {
      const recipe_data = JSON.parse(sessionStorage.getItem('recipe'));

      const recipe_serving_sizes_data = JSON.parse(sessionStorage.getItem('recipe_serving_sizes'));
      const servingSizes = ref(recipe_serving_sizes_data ? recipe_serving_sizes_data : {});

      const current_food_slug = ref(null);
      const current_food = ref(null);
      const modifyServingSizeDialog = ref(false);

      const custom_serving_sizes = ref(null);
      const selected_custom_serving = ref(null);
      const selected_serving_qty = ref(1);

      const custom_servings_ref = ref(null);

      const food_card_key = ref(1);

      const current_food_serving_size = ref(null); // the serving size set for the food being currently updated
      const hasValuesPerContainerToggle = ref(false);

      let isProgrammaticUpdate = false;

      recipe.value = recipe_data;

      if (recipe_data && Object.keys(servingSizes).length === 0) {
        recipe_data.forEach(food => {
          servingSizes.value[food.description_slug] = food.serving_size;
        });
      }

      const serving_count = sessionStorage.getItem('serving_count');
      if (serving_count) {
        servingCount.value = serving_count;
      }


      watch(selected_custom_serving, (new_custom_serving, old_custom_serving) => {
        if (isProgrammaticUpdate) return;
        console.log('is programmatic update: ', isProgrammaticUpdate);
        console.log('===selected_custom_serving changed from', old_custom_serving, 'to', new_custom_serving);
        selected_serving_qty.value = 1;
        current_food_serving_size.value = parseFloat(new_custom_serving);  
      });

      watch(selected_serving_qty, (new_serving_qty, old_serving_qty) => {
        if (isProgrammaticUpdate) return;
        console.log('is programmatic update: ', isProgrammaticUpdate);
        console.log('====serving qty changed: ', new_serving_qty);
        if (selected_custom_serving.value) {
            current_food_serving_size.value = parseFloat(selected_custom_serving.value) * parseInt(new_serving_qty);
        }
      });


      const recommended_daily_values = ref(null);

      const fetchDailyValues = async () => {
        let consolidated_daily_nutrient_dv = null;

        if (sessionStorage.getItem('consolidated_daily_nutrient_dv')) {
            consolidated_daily_nutrient_dv = JSON.parse(sessionStorage.getItem('consolidated_daily_nutrient_dv'));
        } else {
            const fda_daily_nutrient_values_res = await axios.get(`${API_BASE_URI}/consolidated-recommended-daily-nutrient-intake?gender=male&age=19`);
            consolidated_daily_nutrient_dv = fda_daily_nutrient_values_res.data;
            sessionStorage.setItem('consolidated_daily_nutrient_dv', JSON.stringify(consolidated_daily_nutrient_dv));
        }

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
        console.log('now loading data');
        const stored_cs = sessionStorage.getItem('custom_servings');
        if (stored_cs) {
          console.log('stored cs: ', stored_cs);
          custom_servings_ref.value = JSON.parse(stored_cs); 
        }
      }

      onMounted(loadCustomServingsData);


      const openModifyServingSizeModal = (food_slug, custom_servings_category) => {
        console.log('slug: ', food_slug);

        current_food_slug.value = food_slug;
        const found_food = recipe.value.find(itm => itm.description_slug === food_slug);
        current_food.value = found_food;

        if (custom_servings_category) {
          hasValuesPerContainerToggle.value = false;
          console.log('custom servings: ',  custom_servings_category);

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

          console.log('custom servings: ', serving_units);

          if (serving_units && serving_units.length > 0) {
              custom_serving_sizes.value = serving_units;
          }

          // load corresponding custom serving and fill the field if available
          
          const current_custom_serving = custom_servings_ref.value[food_slug];

          if (current_custom_serving) {
            isProgrammaticUpdate = true;

            console.log('current custom serving: ', custom_servings_ref.value[food_slug]);
            const current_serving_size = current_custom_serving.weight * current_custom_serving.qty;
            console.log('current serving size: ', current_serving_size);
            
            selected_custom_serving.value = current_custom_serving.weight;
            selected_serving_qty.value = current_custom_serving.qty;
            current_food_serving_size.value = current_serving_size; // custom_servings_ref.value[food_slug].weight;

            nextTick(() => {
              isProgrammaticUpdate = false;
            });
            
          }

        } else {
          console.log('there are no custom servings');
          const current_food = recipe.value.find(itm => itm.description_slug === food_slug);

          if (current_food.servings_per_container > 1) {
            console.log('has values per container: ');
            hasValuesPerContainerToggle.value = true;
          }

          const current_serving_size = parseFloat(servingSizes.value[food_slug]);

          console.log('current food serving size: ', current_serving_size);
          custom_serving_sizes.value = null;
          selected_custom_serving.value = current_serving_size;
          selected_serving_qty.value = 1;

          current_food_serving_size.value = current_serving_size;

          console.log('current food: ', current_food);
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


      const refreshNutrients = () => {
        const recipe_data = JSON.parse(sessionStorage.getItem('recipe'));
        const recipe_serving_sizes_data = JSON.parse(sessionStorage.getItem('recipe_serving_sizes'));

        if (recipe_data) {
          const aggregated_nutrients = aggregateNutrients(recipe_data, recipe_serving_sizes_data, servingCount.value);

          macros.value = getMacros(aggregated_nutrients);
          vitamins.value = getVitamins(aggregated_nutrients);
          minerals.value = getMinerals(aggregated_nutrients);
          others.value = getOthers(aggregated_nutrients);
        }
        
      }

      refreshNutrients();

      const modifyServingSize = () => {
        console.log('modify serving size: ', current_food_serving_size.value);
      
        modifyServingSizeDialog.value = false;

        updateServingSize(current_food_slug.value, current_food_serving_size.value);

      
        food_card_key.value += 1; // works!

        // issue: the custom serving size for each food is not being stored anywhere else.
        // user must be able to see what they previously selected. with all the details pre-filled

        // todo: store: custom serving, qty to session storage
        let stored_custom_servings = {};
        const stored_cs = sessionStorage.getItem('custom_servings');
        if (stored_cs) {
          stored_custom_servings = JSON.parse(stored_cs);
        }

        stored_custom_servings[current_food_slug.value] = {
          'weight': selected_custom_serving.value,
          'qty': selected_serving_qty.value, 
        }
        console.log('stored custom servings: ', stored_custom_servings);

        custom_servings_ref.value = stored_custom_servings;

        sessionStorage.setItem('custom_servings', JSON.stringify(stored_custom_servings));
      }


      const removeFood = (slug) => {
       
        const updated_recipe = recipe.value.filter((food) => {
          return food.description_slug !== slug;
        }); 

        sessionStorage.setItem('recipe', JSON.stringify(updated_recipe));

        recipe.value = updated_recipe;   

        delete servingSizes.value[slug];             

        sessionStorage.setItem('recipe_serving_sizes', JSON.stringify(servingSizes.value));

        emit('update-ingredient-count-child');

        refreshNutrients();
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
      }


      return {
        removeFood,
        recommended_daily_values,
        servingSizes,
        updateServingSize,
        onUpdateServingCount,
        getValueColor,

        current_food_slug,
        current_food,
        modifyServingSize,
        modifyServingSizeDialog,
        custom_serving_sizes,
        selected_custom_serving,
        selected_serving_qty,

        custom_servings_ref,
        current_food_serving_size,
        hasValuesPerContainerToggle,

        openModifyServingSizeModal,
        food_card_key,
      }
    },

    data: () => ({
      recipe,
      servingCount,

      macros,
      vitamins,
      minerals,
      others,

      newServingSize,
      newServingCount,

    }),

   
}
</script>