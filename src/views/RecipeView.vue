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
            @update-serving-size="updateServingSize" />
        </div>
      </div>

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
import FoodCard from '@/components/FoodCard.vue';
import NutrientsTable from '@/components/NutrientsTable.vue'
import { ref } from 'vue';

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

// todo: get from api or localstorage
const recommended_daily_values = ref({"sugar":50,"biotin":30,"calcium":1300,"chloride":2300,"choline":550,"cholesterol":300,"chromium":35,"copper":0.9,"dietary fiber":28,"total fat":78,"vitamin b9":400,"iodine":150,"iron":18,"magnesium":420,"manganese":2.3,"molybdenum":45,"vitamin b3":16,"vitamin b5":5,"phosphorus":1250,"potassium":4700,"protein":50,"vitamin b2":1.3,"saturated fat":20,"selenium":55,"sodium":2300,"vitamin b1":1.2,"total carbohydrates":275,"vitamin a":900,"vitamin b6":1.7,"vitamin b12":2.4,"vitamin c":90,"vitamin d":20,"vitamin e":15,"vitamin k":120,"zinc":11});
const newServingSize = ref(null);
const newServingCount = ref(1);

export default {
    components: {
      FoodCard,  
      NutrientsTable
    },


    setup(props, { emit }) {
      const recipe_data = JSON.parse(localStorage.getItem('recipe'));


      const recipe_serving_sizes_data = JSON.parse(localStorage.getItem('recipe_serving_sizes'));
      const servingSizes = ref(recipe_serving_sizes_data ? recipe_serving_sizes_data : {});
    
      recipe.value = recipe_data;

      if (recipe_data && Object.keys(servingSizes).length === 0) {
        recipe_data.forEach(food => {
          servingSizes.value[food.description_slug] = food.serving_size;
        });
      }

      const serving_count = localStorage.getItem('serving_count');
      if (serving_count) {
        servingCount.value = serving_count;
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
        const recipe_data = JSON.parse(localStorage.getItem('recipe'));
        const recipe_serving_sizes_data = JSON.parse(localStorage.getItem('recipe_serving_sizes'));

        if (recipe_data) {
          const aggregated_nutrients = aggregateNutrients(recipe_data, recipe_serving_sizes_data, servingCount.value);

          macros.value = getMacros(aggregated_nutrients);
          vitamins.value = getVitamins(aggregated_nutrients);
          minerals.value = getMinerals(aggregated_nutrients);
          others.value = getOthers(aggregated_nutrients);
        }
        
      }

      refreshNutrients();


      const removeFood = (slug) => {
       
        const updated_recipe = recipe.value.filter((food) => {
          return food.description_slug !== slug;
        }); 

        localStorage.setItem('recipe', JSON.stringify(updated_recipe));

        recipe.value = updated_recipe;   

        delete servingSizes.value[slug];             

        localStorage.setItem('recipe_serving_sizes', JSON.stringify(servingSizes.value));

        emit('update-ingredient-count-child');

        refreshNutrients();
      }

      const updateServingSize = (slug, newServingSize) => {
        servingSizes.value[slug] = newServingSize;
        localStorage.setItem('recipe_serving_sizes', JSON.stringify(servingSizes.value));


        emit('update-ingredient-serving-size-child');

        refreshNutrients();
      }

      const onUpdateServingCount = () => {
        emit('update-ingredient-serving-count-child', servingCount.value); 

        refreshNutrients();
      }


      return {
        removeFood,

        servingSizes,
        updateServingSize,
        onUpdateServingCount,
        getValueColor
      }
    },

    data: () => ({
      recipe,
      servingCount,

      macros,
      vitamins,
      minerals,
      others,

      recommended_daily_values,
      newServingSize,
      newServingCount,

    }),

   
}
</script>