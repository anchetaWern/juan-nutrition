<template>
    <div class="mt-5 pt-5">
        <v-alert
            border="top"
            type="warning"
            variant="outlined"
            prominent
            v-if="items.length === 0"
          >
          No matches found. Please try a different query.
        </v-alert>
    </div>

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


  watch: {
    '$route.query': {
      deep: true,
      handler(newParams, oldParams) {
       
        if (JSON.stringify(newParams) !== JSON.stringify(oldParams)) {
        
          this.updateSearchResults();
        }
      }
    }
  },

  created() {
    
    this.updateSearchResults();
  },
  

  methods: {

    constructComplexQuery(str) {
      const regex = /(carbohydrates|protein|fat|calories)(>=|<=|>|<|=)(\d+)(g|kcal|ml)(?:,|$)/g;
      let match;

      let formattedQuery = '';

      const conditions = {
        '>': 'gt',
        '<': 'lt',
        '>=': 'gte',
        '<=': 'lte',
        '=': 'eq'
      };

      while ((match = regex.exec(str)) !== null) {
        const keyword = match[1];
        const cond = match[2];
        const value = parseInt(match[3]);
        const unit = match[4];

        if (keyword) {
          formattedQuery += `${keyword}=${conditions[cond]}${value}${unit}&`;
        }
      }

      if (formattedQuery.charAt(formattedQuery.length - 1) === '&') {
        formattedQuery = formattedQuery.substr(0, formattedQuery.length - 1);
      }

      return formattedQuery;
    },
   
    constructQuery() {
      let formattedQuery = '';
      const query = this.$route.query.q;

      const keywords = ['carbohydrates', 'fat', 'protein', 'calories'];
      
      if (query && keywords.some(v => query.includes(v))) {
       
        formattedQuery = this.constructComplexQuery(query);
      } else {
        formattedQuery = query ? `description=${query}` : '';
      }

      return formattedQuery;
    },

    updateSearchResults() {
      const query = this.constructQuery();

      axios.get(`http://pinoy-food-api.test/api/foods?${query}`)
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
    }

  }


});
</script>