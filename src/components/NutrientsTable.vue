<template>
  <div>
    <v-table density="compact">
      <tbody>
        
        <template v-for="nutrient in nutrients" :key="nutrient.name">
            <tr>
                <td>{{ capitalizeWords(nutrient.name) }}</td>
                <td>
                    {{ nutrient.amount }}{{ nutrient.unit }}
                </td>
            </tr>

            <tr v-if="nutrient.composition">
                <td colspan="2">
                    <NutrientsTable :nutrients="nutrient.composition" />
                </td>
            </tr>
        </template>

      </tbody>
    </v-table>
    
  </div>
</template>

<script>
import {capitalizeWords} from '@/helpers/Str';

export default {
  props: {
    nutrients: {
      type: Array,
      required: true
    }
  },

  setup(){
      return {
          capitalizeWords
      }
  }
  
};
</script>
