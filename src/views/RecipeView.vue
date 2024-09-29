<template>
 
    <v-container class="mt-5" id="recipe-container" v-if="recipe">
      <div class="text-h6 mb-2">Estimate recipe nutrients</div>

      <v-text-field
        v-model="servingCount"
        @input="onInput"
        label="Number of servings"
      ></v-text-field>

      <div v-for="food in recipe" :key="food.description_slug" class="mb-3">
        <FoodCard 
          :food="food" 
          :removeFood="removeFood" 
          :initialServingSize="servingSizes[food.description_slug]"
          @update-serving-size="updateServingSize" />
      </div>
      
    </v-container>
  

    <div class="mt-3" v-if="macros.length">
      <span class="text-subtitle-2">Macros</span>
      <NutrientsTable 
        v-if="macros"
        :nutrients="macros" 
        servingsPerContainer="1" 
        displayValuesPerContainer="false"
        :recommended_daily_values="recommended_daily_values"
        :newServingSize="newServingSize"
        :newServingCount="newServingCount" />
    </div>


    <div class="mt-3" v-if="vitamins.length">
      <span class="text-subtitle-2">Vitamins</span>
      <NutrientsTable 
        :nutrients="vitamins" 
        :servingsPerContainer="servingsPerContainer" 
        :displayValuesPerContainer="displayValuesPerContainer"
        :recommended_daily_values="recommended_daily_values"
        :newServingSize="newServingSize"
        :newServingCount="newServingCount" />
    </div>

    <div class="mt-3" v-if="minerals.length">
      <span class="text-subtitle-2">Minerals</span>
      <NutrientsTable 
        :nutrients="minerals" 
        :servingsPerContainer="servingsPerContainer" 
        :displayValuesPerContainer="displayValuesPerContainer"
        :recommended_daily_values="recommended_daily_values"
        :newServingSize="newServingSize"
        :newServingCount="newServingCount" />
    </div>

    <div class="mt-3" v-if="others.length">
      <span class="text-subtitle-2">Others</span>
      <NutrientsTable 
        :nutrients="others" 
        :servingsPerContainer="servingsPerContainer" 
        :displayValuesPerContainer="displayValuesPerContainer"
        :recommended_daily_values="recommended_daily_values"
        :newServingSize="newServingSize"
        :newServingCount="newServingCount" />
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
      const serving_sizes_data = JSON.parse(localStorage.getItem('serving_sizes'));
      const servingSizes = ref(serving_sizes_data ? serving_sizes_data : {});
     
      recipe.value = recipe_data;

      if (Object.keys(servingSizes).length === 0) {
        recipe_data.forEach(food => {
          servingSizes.value[food.description_slug] = food.serving_size;
        });
      }

      const serving_count = localStorage.getItem('serving_count');
      if (serving_count) {
        servingCount.value = serving_count;
      }

      const aggregated_nutrients = aggregateNutrients(recipe_data, serving_sizes_data);

   
      macros.value = getMacros(aggregated_nutrients);
      vitamins.value = getVitamins(aggregated_nutrients);
      minerals.value = getMinerals(aggregated_nutrients);
      others.value = getOthers(aggregated_nutrients);

      const removeFood = (slug) => {
       
        const updated_recipe = recipe.value.filter((food) => {
          return food.description_slug !== slug;
        }); 

        localStorage.setItem('recipe', JSON.stringify(updated_recipe));

        recipe.value = updated_recipe;   

        delete servingSizes.value[slug];             

        localStorage.setItem('serving_sizes', JSON.stringify(servingSizes.value));

        emit('update-ingredient-count-child');

        // todo: update estimated nutrients
      }

      const updateServingSize = (slug, newServingSize) => {
        servingSizes.value[slug] = newServingSize;
        localStorage.setItem('serving_sizes', JSON.stringify(servingSizes.value));


        emit('update-serving-size-child');

        // todo: update estimated nutrients
      }


      return {
        removeFood,

        servingSizes,
        updateServingSize,
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
      newServingCount

    }),

    methods: {
      onInput() {
        this.$emit('update-serving-count-child', this.servingCount); 
      }
    }
}
</script>