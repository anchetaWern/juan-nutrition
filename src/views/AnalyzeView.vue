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

    </v-container>
    

</template>



<script>
import FoodCard from '@/components/FoodCard.vue';
import { ref } from 'vue';

const analyze = ref(null);


export default {
    components: {
      FoodCard,  
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
      }


      const updateServingSize = (slug, newServingSize) => {
        servingSizes.value[slug] = newServingSize;
        localStorage.setItem('analyze_serving_sizes', JSON.stringify(servingSizes.value));

        emit('update-analyze-serving-size-child');
      }

      return {
        removeFood,

        servingSizes,
        updateServingSize,
      }
    },

    data: () => ({
      analyze,
    }),

   
}
</script>