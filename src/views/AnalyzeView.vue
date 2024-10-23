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
            @update-serving-size="updateServingSize" />
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

    </v-container>
    

</template>

<style scoped>
#analyze-container {
  padding: 0.5rem 0 !important;
}
</style>

<script>
import FoodCard from '@/components/FoodCard.vue';
import NutritionCard from '@/components/NutritionCard.vue';
import NutrientsTable from '@/components/NutrientsTable.vue';

import { ref } from 'vue';

import { 
    aggregateNutrients,
    filterNutrients,
    filterDeficientNutrients,
    filterOverconsumedNutrients,
    filterGoodCoverageNutrients,
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

export default {
    components: {
      FoodCard,  
      NutritionCard,
      NutrientsTable,
    },


    setup(props, { emit }) {
      const analyze_data = JSON.parse(sessionStorage.getItem('analyze'));

      const analyze_serving_sizes_data = JSON.parse(sessionStorage.getItem('analyze_serving_sizes'));
      const servingSizes = ref(analyze_serving_sizes_data ? analyze_serving_sizes_data : {});

      const recommended_daily_values = ref(null);

      analyze.value = analyze_data;

      if (analyze_data && Object.keys(servingSizes).length === 0) {
        analyze_data.forEach(food => {
          servingSizes.value[food.description_slug] = food.serving_size;
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

        const fda_daily_nutrient_values_arr = consolidated_daily_nutrient_dv.map((itm) => {
            return {
                [itm.nutrient]: itm.daily_value,
            }
        });
        const fda_daily_nutrient_values = Object.assign({}, ...fda_daily_nutrient_values_arr);
        recommended_daily_values.value = fda_daily_nutrient_values;
      }

      fetchDailyValues();


      const removeFood = (slug) => {
       
        const updated_analyze = analyze.value.filter((food) => {
          return food.description_slug !== slug;
        }); 

        sessionStorage.setItem('analyze', JSON.stringify(updated_analyze));

        analyze.value = updated_analyze;   

        emit('update-analyze-count-child');

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

        recommended_daily_values
      }
    },

    data: () => ({
      analyze,
      
    }),

   
}
</script>