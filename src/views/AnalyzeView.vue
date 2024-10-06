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
        <div class="text-subtitle-1 mb-2">Summary</div>

        <v-row justify="space-between" dense>
          <v-col
            v-for="summary_nut in summary_nutrients"
            :key="summary_nut.name"
            sm="4" 
            md="4"
          >
            <NutritionCard :nutrient="summary_nut" :limits="recommended_daily_values" />
          </v-col>
        </v-row>
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
import { ref } from 'vue';

import { 
    aggregateNutrients,
    filterNutrients,
} from '@/helpers/Nutrients';

const analyze = ref(null);

const recommended_daily_values = ref({"sugar":50,"biotin":30,"calcium":1300,"chloride":2300,"choline":550,"cholesterol":300,"chromium":35,"copper":0.9,"dietary fiber":28,"total fat":78,"vitamin b9":400,"iodine":150,"iron":18,"magnesium":420,"manganese":2.3,"molybdenum":45,"vitamin b3":16,"vitamin b5":5,"phosphorus":1250,"potassium":4700,"protein":50,"vitamin b2":1.3,"saturated fat":20,"selenium":55,"sodium":2300,"vitamin b1":1.2,"total carbohydrates":275,"vitamin a":900,"vitamin b6":1.7,"vitamin b12":2.4,"vitamin c":90,"vitamin d":20,"vitamin e":15,"vitamin k":120,"zinc":11});

const summary_nutrients_values = ['sodium', 'saturated fat', 'cholesterol', 'dietary fiber', 'sugar', 'protein']; 

const summary_nutrients = ref(null);

export default {
    components: {
      FoodCard,  
      NutritionCard
    },


    setup(props, { emit }) {
      const analyze_data = JSON.parse(localStorage.getItem('analyze'));

      const analyze_serving_sizes_data = JSON.parse(localStorage.getItem('analyze_serving_sizes'));
      const servingSizes = ref(analyze_serving_sizes_data ? analyze_serving_sizes_data : {});
    
      analyze.value = analyze_data;

      if (analyze_data && Object.keys(servingSizes).length === 0) {
        analyze_data.forEach(food => {
          servingSizes.value[food.description_slug] = food.serving_size;
        });
      }


      const removeFood = (slug) => {
       
        const updated_analyze = analyze.value.filter((food) => {
          return food.description_slug !== slug;
        }); 

        localStorage.setItem('analyze', JSON.stringify(updated_analyze));

        analyze.value = updated_analyze;   

        emit('update-analyze-count-child');

        refreshNutrients();
      }


      const updateServingSize = (slug, newServingSize) => {
        servingSizes.value[slug] = newServingSize;
        localStorage.setItem('analyze_serving_sizes', JSON.stringify(servingSizes.value));

        emit('update-analyze-serving-size-child');

        refreshNutrients();
      }


      const refreshNutrients = () => {
        const analyze_data = JSON.parse(localStorage.getItem('analyze'));
        const analyze_serving_sizes_data = JSON.parse(localStorage.getItem('analyze_serving_sizes'));

        if (analyze_data && analyze_serving_sizes_data) {
          console.log('analyze data: ', analyze_data);
          console.log('analyze serving sizes: ', analyze_serving_sizes_data);

          const aggregated_nutrients = aggregateNutrients(analyze_data, analyze_serving_sizes_data, 1);
          console.log('AGRO: ', JSON.stringify(aggregated_nutrients));


          const filtered_nutrients = filterNutrients(aggregated_nutrients, summary_nutrients_values);
          console.log('filtered: ', filtered_nutrients);

          summary_nutrients.value = filtered_nutrients;

          // todo: find the sodium, saturated fat, sugars, cholesterol, protein, fiber
          // push to an array of objects then render it in the summary
        
        }
        
      }

      refreshNutrients();

      return {
        removeFood,

        servingSizes,
        updateServingSize,

        summary_nutrients,
        recommended_daily_values,
      }
    },

    data: () => ({
      analyze,
      
    }),

   
}
</script>