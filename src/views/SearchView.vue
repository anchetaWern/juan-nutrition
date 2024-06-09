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
    
    <div class="text-center">
        <v-container>
          <v-row justify="center">
            <v-col cols="12">
              <v-container class="max-width">
                <v-pagination
                  v-model="currentPage"
                  :length="totalPages"
                  class="my-4"
                ></v-pagination>
              </v-container>
            </v-col>
          </v-row>
        </v-container>
    </div>

</template>

<script>
import { defineComponent, watch, ref, getCurrentInstance } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';


export default defineComponent({
  data: () => ({
    dialog: false,
    items: [
      
    ],
  }),

  setup() {

    const route = useRoute();
    const router = useRouter();

    const currentCategory = ref(parseInt(route.query.category) || null);
    const currentPage = ref(parseInt(route.query.page) || 1);
    const totalPages = ref(1);
    const instance = getCurrentInstance();

    watch(currentPage, (newPage, oldPage) => {
      router.push({ query: { ...route.query, page: newPage } });
      instance.proxy.updateSearchResults();
    });

    watch(
      () => route.query.page,
      (newPage) => {
        currentPage.value = parseInt(newPage) || 1;
      }
    );

  

    watch(
      () => route.query.category,
      (newCategory) => {
        currentCategory.value = parseInt(newCategory) || null;
      }
    );

    return {
      currentPage,
      currentCategory,
      totalPages,
    };
  },


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

      const macros_keys = ['total carbohydrates', 'protein', 'total fat'];
      
      const url = this.currentCategory ? `http://pinoy-food-api.test/api/foods?${query}&category=${this.currentCategory}&page=${this.currentPage}` : `http://pinoy-food-api.test/api/foods?${query}&page=${this.currentPage}`;
     
      axios.get(url)
        .then((res) => {
          const items_per_page = 10;
          this.totalPages = Math.round(res.data.total / items_per_page);

          this.items = res.data.data.flatMap((itm, index, array) => {
            
            const macros = itm.nutrients.map((nutrient) => {
              if (macros_keys.indexOf(nutrient.name) !== -1) {
                return {
                  [nutrient.name]: `${nutrient.amount}${nutrient.unit}` 
                }
                return false;
              }
            })
            .filter(nut => nut)
            .reduce((acc, obj) => {
              return { ...acc, ...obj };
            }, {});

            const item = {
              prependAvatar: itm.title_image,
              title: itm.description,
              subtitle: `${itm.calories}${itm.calories_unit}; C: ${macros['total carbohydrates']} F: ${macros['total fat']}, P: ${macros['protein']}`,
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