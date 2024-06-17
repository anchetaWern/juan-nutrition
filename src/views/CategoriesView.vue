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
 

    <v-container class="mt-5" id="category-container">
      <v-row dense justify="center">
        <v-col
          v-for="card in cards"
          :key="card.title"
          :cols="card.flex"
        >
          <v-card @click="goToCategory(card.slug)">
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

<style scoped>
#category-container {
  max-width: 450px;
}
</style>

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
            { id: 2, slug: 'vegetables', title: 'Vegetables', src: vegetablesImage, flex: 12 },
            { id: 4, slug: 'meat-and-poultry', title: 'Meat and Poultry', src: meatAndPoultryImage, flex: 6 },
            { id: 7, slug: 'legumes-nuts-and-seeds', title: 'Legumes, nuts, and seeds', src: legumesNutsSeedsImage, flex: 6 },
            { id: 8, slug: 'fats-and-oils', title: 'Fats and Oils', src: fatsAndOilsImage, flex: 6 },

            { id: 3, slug: 'fruits', title: 'Fruits', src: fruitsImage, flex: 6 },
            { id: 1, slug: 'cereals-and-grains', title: 'Cereals and Grains', src: cerealsAndGrainsImage, flex: 6 },

            { id: 6, slug: 'dairy-products', title: 'Dairy Products', src: dairyProductsImage, flex: 6 },
            
            { id: 11, slug: 'herbs-and-spices', title: 'Herbs and Spices', src: herbsAndSpicesImage, flex: 6 },
            
            { id: 10, slug: 'beverages', title: 'Beverages', src: beveragesImage, flex: 6 },
            
            { id: 12, slug: 'prepared-and-processed', title: 'Prepared and Processed', src: preparedAndProcessedImage, flex: 6 },
            { id: 9, slug: 'sugars-and-sweets', title: 'Sugars and Sweets', src: sugarsAndSweetsImage, flex: 6 },
        ],
    }),

    methods: {
        goToCategory(slug) {
         
            this.$router.push(`/search?category=${slug}`);
        }
    }
}
</script>