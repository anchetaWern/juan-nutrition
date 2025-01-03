<template>
 
    <v-container class="mt-5" id="analyze-container">
    
      <div class="text-h6 mb-2">Analyze your diet</div>

      <v-alert 
        v-if="!analyze || analyze.length === 0"
        density="compact"
        type="warning"
        variant="outlined"
      >
        You haven't added any foods yet. You can click on the 'Analyze' button on a food page to add it. 
      </v-alert>

      <div v-if="analyze && analyze.length > 0">
       
        <div v-for="food in analyze" :key="food.description_slug" class="mb-3">
          <FoodCard 
            :food="food" 
            :removeFood="removeFood"
            :initialServingSize="servingSizes[food.description_slug]"
            @update-serving-size="updateServingSize"
            :openModifyServingSizeModal="openModifyServingSizeModal"
            :key="food_card_key" />
        </div>
      </div>

      <div v-if="analyze && analyze.length > 0">
        <div class="text-subtitle-1 mt-5 mb-2">Summary</div>

        <v-row justify="space-between" dense no-gutters>
          <v-col
            v-for="summary_nut in summary_nutrients"
            :key="summary_nut.name"
            sm="4" 
            md="4"
            class="mb-1"
          >
            <NutritionCard :nutrient="summary_nut" :limits="recommended_daily_values" />
          </v-col>
        </v-row>

        <div v-if="deficient_nutrients && deficient_nutrients.length > 0">
          <div class="text-subtitle-1 mt-5 mb-2">Deficient Nutrients</div>

          <div>
            <NutrientsTable 
              :nutrients="deficient_nutrients" 
              servingsPerContainer="1" 
              displayValuesPerContainer="false"
              :recommended_daily_values="recommended_daily_values"
              :newServingSize="newServingSize"
              :newServingCount="newServingCount"
              :getValueColor="getValueColor"  />
          </div>
        </div>

        <div v-if="overconsumed_nutrients && overconsumed_nutrients.length > 0">
          <div class="text-subtitle-1 mt-5 mb-2">Over-consumed nutrients</div>

          <div>
            <NutrientsTable 
              :nutrients="overconsumed_nutrients" 
              servingsPerContainer="1" 
              displayValuesPerContainer="false"
              :recommended_daily_values="recommended_daily_values"
              :newServingSize="newServingSize"
              :newServingCount="newServingCount"
              :getValueColor="getValueColor" />
          </div>
        </div>

        <div v-if="good_coverage_nutrients && good_coverage_nutrients.length > 0">
          <div class="text-subtitle-1 mt-5 mb-2">Nutrients with good coverage</div>

          <div>
            <NutrientsTable 
              :nutrients="good_coverage_nutrients" 
              servingsPerContainer="1" 
              displayValuesPerContainer="false"
              :recommended_daily_values="recommended_daily_values"
              :newServingSize="newServingSize"
              :newServingCount="newServingCount"
              :getValueColor="getValueColor"  />
          </div>
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
    

</template>

<style scoped>
#analyze-container {
  padding: 0.5rem 0 !important;
}
</style>

<script>
import { VNumberInput } from 'vuetify/labs/VNumberInput'
import FoodCard from '@/components/FoodCard.vue';
import NutritionCard from '@/components/NutritionCard.vue';
import NutrientsTable from '@/components/NutrientsTable.vue';

import { ref, watch, onMounted, nextTick } from 'vue';

import { 
    aggregateNutrients,
    filterNutrients,
    filterDeficientNutrients,
    filterOverconsumedNutrients,
    filterGoodCoverageNutrients,
    convertWeight,
} from '@/helpers/Nutrients';

import { calculatePercentage } from '@/helpers/Numbers';


const analyze = ref(null);

const summary_nutrients_values = ['water', 'protein', 'dietary fiber', 'sodium', 'saturated fat', 'cholesterol', 'sugar', 'total carbohydrates', 'total fat']; 

const summary_nutrients = ref(null);

const deficient_nutrients = ref(null);
const good_coverage_nutrients = ref(null);
const overconsumed_nutrients = ref(null);

const newServingSize = ref(null);
const newServingCount = ref(1);


//

export default {
    components: {
      FoodCard,  
      NutritionCard,
      NutrientsTable,
      VNumberInput
    },


    setup(props, { emit }) {
      const analyze_data = JSON.parse(sessionStorage.getItem('analyze'));

      const analyze_serving_sizes_data = JSON.parse(sessionStorage.getItem('analyze_serving_sizes'));
      const servingSizes = ref(analyze_serving_sizes_data ? analyze_serving_sizes_data : {});

      const recommended_daily_values = ref(null);


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

      analyze.value = analyze_data;

      if (analyze_data && Object.keys(servingSizes).length === 0) {
        analyze_data.forEach(food => {
          servingSizes.value[food.description_slug] = food.serving_size;
        });
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
    

      const loadCustomServingsData = () => {
        // load custom servings data
        const stored_cs = sessionStorage.getItem('analyze_custom_servings');
        if (stored_cs) {
         
          custom_servings_ref.value = JSON.parse(stored_cs); 
        }
      }

      onMounted(loadCustomServingsData);


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

      const openModifyServingSizeModal = (food_slug, custom_servings_category) => {
       
        current_food_slug.value = food_slug;
        const found_food = analyze.value.find(itm => itm.description_slug === food_slug);
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
         
          const current_food = analyze.value.find(itm => itm.description_slug === food_slug);

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

      const modifyServingSize = () => {
      
        modifyServingSizeDialog.value = false;

        updateServingSize(current_food_slug.value, current_food_serving_size.value);

        food_card_key.value += 1; 

        let stored_custom_servings = {};
        const stored_cs = sessionStorage.getItem('analyze_custom_servings');
        if (stored_cs) {
          stored_custom_servings = JSON.parse(stored_cs);
        }

        stored_custom_servings[current_food_slug.value] = {
          'weight': selected_custom_serving.value,
          'qty': selected_serving_qty.value, 
        }
      
        custom_servings_ref.value = stored_custom_servings;

        sessionStorage.setItem('analyze_custom_servings', JSON.stringify(stored_custom_servings));
      }


      const removeFood = (slug) => {
       
        const updated_analyze = analyze.value.filter((food) => {
          return food.description_slug !== slug;
        }); 

        sessionStorage.setItem('analyze', JSON.stringify(updated_analyze));

        analyze.value = updated_analyze;   
        delete servingSizes.value[slug];  

        emit('update-analyze-count-child');

        const stored_cs = sessionStorage.getItem('analyze_custom_servings');
        if (stored_cs) {
          const stored_custom_servings = JSON.parse(stored_cs);
          delete stored_custom_servings[slug];

          if (Object.keys(stored_custom_servings).length > 0) {
           
            sessionStorage.setItem('analyze_custom_servings', JSON.stringify(stored_custom_servings));

            const updated_analyze_serving_sizes = Object.fromEntries(
              Object.entries(servingSizes.value).map(([key, value]) => [key, value])
            );

            sessionStorage.setItem('analyze_serving_sizes', JSON.stringify(updated_analyze_serving_sizes));
          } else {
            sessionStorage.removeItem('analyze_custom_servings');
            sessionStorage.removeItem('analyze_serving_sizes');
          }
      
        }

        refreshNutrients();
      }


      const updateServingSize = (slug, newServingSize) => {
     
        servingSizes.value[slug] = newServingSize;
        sessionStorage.setItem('analyze_serving_sizes', JSON.stringify(servingSizes.value));

        emit('update-analyze-serving-size-child');

        refreshNutrients();
      }

      const getRailColor = (value, daily_limit) => {
        return 'grey-darken-3';
      };

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
        const analyze_data = JSON.parse(sessionStorage.getItem('analyze'));
        const analyze_serving_sizes_data = JSON.parse(sessionStorage.getItem('analyze_serving_sizes'));

        if (analyze_data && analyze_serving_sizes_data) {
         
          const aggregated_nutrients = aggregateNutrients(analyze_data, analyze_serving_sizes_data, 1);
        
          const filtered_nutrients = filterNutrients(aggregated_nutrients, summary_nutrients_values);
         
          const filtered_deficient_nutrients = filterDeficientNutrients(aggregated_nutrients, recommended_daily_values.value);
         
          const filtered_overconsumed_nutrients = filterOverconsumedNutrients(aggregated_nutrients, recommended_daily_values.value);
         
          const overconsumed_nutrient_names = filtered_overconsumed_nutrients.map(itm => itm.name);
          
          // exclude overconsumed nutrients
          const filtered_good_coverage_nutrients = filterGoodCoverageNutrients(aggregated_nutrients, recommended_daily_values.value, overconsumed_nutrient_names);
         
          summary_nutrients.value = filtered_nutrients;

          deficient_nutrients.value = filtered_deficient_nutrients;
          good_coverage_nutrients.value = filtered_good_coverage_nutrients;
          overconsumed_nutrients.value = filtered_overconsumed_nutrients;
        
        }
        
      }

      refreshNutrients();

      return {
        removeFood,

        servingSizes,
        updateServingSize,

        summary_nutrients,
        recommended_daily_values,
        deficient_nutrients,
        overconsumed_nutrients,
        good_coverage_nutrients,

        getRailColor,
        getValueColor,

        recommended_daily_values,

        openModifyServingSizeModal,

        current_food_slug,
        current_food,
        modifyServingSizeDialog,
        custom_serving_sizes,

        custom_servings_ref,
        selected_custom_serving,
        selected_serving_qty,
        current_food_serving_size,
        
        hasValuesPerContainerToggle,
        modifyServingSize,

        food_card_key,
        convertWeight
      }
    },

    data: () => ({
      analyze,
      
    }),

   
}
</script>