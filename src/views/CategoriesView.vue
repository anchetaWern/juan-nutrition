<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>


<template>
 

    <v-container class="px-0 mx-0 mt-5" fluid>
      <v-row dense>
        <v-col
          v-for="card in cards"
          :key="card.title"
          :cols="card.flex"
        >
          <v-card @click="goToCategory(card.id)">
            <v-img
              :src="card.src"
              class="align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="200px"
              cover
            >
              <v-card-title class="text-white text-body-2 text-wrap" v-text="card.title"></v-card-title>
            </v-img>

          </v-card>
        </v-col>
      </v-row>
    </v-container>
 
</template>

<script>

import vegetablesImage from '@/assets/images/vegetables.jpg';
import fruitsImage from '@/assets/images/fruits.jpg';
import dairyProductsImage from '@/assets/images/dairy-products.jpg';
import cerealsAndGrainsImage from '@/assets/images/cereals-and-grains.jpg';
import herbsAndSpicesImage from '@/assets/images/herbs-and-spices.jpg';
import legumesNutsSeedsImage from '@/assets/images/legumes-nuts-seeds.jpg';
import meatAndPoultryImage from '@/assets/images/meat-and-poultry.jpg';
import fatsAndOilsImage from '@/assets/images/fats-and-oils.jpg';
import beveragesImage from '@/assets/images/beverages.jpg';
import sugarsAndSweetsImage from '@/assets/images/sugars-and-sweets.jpg';
import preparedAndProcessedImage from '@/assets/images/prepared-and-processed.jpg'

export default {
    data: () => ({
        cards: [
            { id: 2, title: 'Vegetables', src: vegetablesImage, flex: 12 },
            { id: 4, title: 'Meat and Poultry', src: meatAndPoultryImage, flex: 6 },
            { id: 7, title: 'Legumes, nuts, and seeds', src: legumesNutsSeedsImage, flex: 6 },
            { id: 8, title: 'Fats and Oils', src: fatsAndOilsImage, flex: 6 },

            { id: 3, title: 'Fruits', src: fruitsImage, flex: 6 },
            { id: 1, title: 'Cereals and Grains', src: cerealsAndGrainsImage, flex: 6 },

            { id: 6, title: 'Dairy Products', src: dairyProductsImage, flex: 6 },
            
            { id: 11, title: 'Herbs and Spices', src: herbsAndSpicesImage, flex: 6 },
            
            { id: 10, title: 'Beverages', src: beveragesImage, flex: 6 },
            
            { id: 12, title: 'Prepared and Processed', src: preparedAndProcessedImage, flex: 6 },
            { id: 9, title: 'Sugars and Sweets', src: sugarsAndSweetsImage, flex: 6 },
        ],
    }),

    methods: {
        goToCategory(id) {
         
            this.$router.push(`/search?category=${id}`);
        }
    }
}
</script>