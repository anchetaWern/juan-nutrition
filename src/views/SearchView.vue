<template>
   
    <v-card
      class="mx-auto"
      max-width="450"
    >
      <v-list
        :items="items"
        lines="three"
        item-props
      >
          
      </v-list>
    </v-card>    

</template>

<script>
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
  data: () => ({
    dialog: false,
    items: [
      
    ],
  }),


  created() {

    axios.get(`http://pinoy-food-api.test/api/foods`)
      .then((res) => {
        
        this.items = res.data.flatMap((itm, index, array) => {
          const item = {
            prependAvatar: itm.title_image,
            title: itm.description,
            subtitle: `${itm.calories}${itm.calories_unit}`,
            to: `/food/${itm.description_slug}`
          };

          if (index < array.length - 1) {
            return [item, { type: 'divider' }];
          } else {
            return [item];
          }
        });

      })
      .catch((err) => {
        console.log('err: ', err);
      });
  },


});
</script>