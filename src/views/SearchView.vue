<template>
    
    <div class="mt-5 pt-5">
        <div class="text-center">
          <v-progress-circular indeterminate v-if="isLoading" color="primary"></v-progress-circular>
        </div>

        <div v-if="!isLoading">
          <v-alert
              border="top"
              type="warning"
              variant="outlined"
              prominent
              v-if="items.length === 0"
            >
            No matches found for query '{{state.searchSummary}}'. Please try a different query.
          </v-alert>

          <v-alert :text="`Showing results for '${state.searchSummary}'`" class="mb-2" v-if="state.searchSummary && items.length > 0" type="info"></v-alert>
        </div>
    </div>

  
    <v-card class="mx-auto" max-width="450" v-if="!isLoading">

      <v-list
        :items="items"
        lines="three"
        item-props
      >
          
      </v-list>
    </v-card>  
    
    <div class="text-center" v-if="!isLoading">
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
import { defineComponent, watch, ref, getCurrentInstance, reactive } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { unslugify } from '@/helpers/Str';

const API_BASE_URI = import.meta.env.VITE_API_URI;

export default defineComponent({
  data: () => ({
    dialog: false,
    items: [],
  }),
  

  setup() {

    const state = reactive({
      searchSummary: ''
    });

    const { proxy } = getCurrentInstance();

    const route = useRoute();
    const router = useRouter();

    const currentCategory = ref(route.query.category || null);
    const currentPage = ref(parseInt(route.query.page) || 1);
    const totalPages = ref(1);
    const instance = getCurrentInstance();

    const isLoading = ref(true);

    function updateSearchSummary(newSummary) {
      state.searchSummary = newSummary;
    }


    const params = new URLSearchParams(route.query);

    
    let search_summary = '';

    const categories = JSON.parse(sessionStorage.getItem('food_types'));

    function getCategory(slug) {
      if (categories) {
        return categories.find(cat => cat.slug === slug);
      }
      return {name: unslugify(slug)};
    }

    if (currentCategory.value) {
      search_summary += `Category: ${getCategory(currentCategory.value).name}`;
    }

    if (params.get('q')) {
     
      if (currentCategory.value) {
        search_summary += ", ";
      }
      search_summary += `${params.get('q')}`;
    }

    updateSearchSummary(search_summary);


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
        currentCategory.value = newCategory || null;
      }
    );

    return {
      currentPage,
      currentCategory,
      totalPages,
      updateSearchSummary,
      state,

      isLoading
    };
  },


  watch: {
    '$route.query': {
      deep: true,
      handler(newParams, oldParams) {
       
        if (JSON.stringify(newParams) !== JSON.stringify(oldParams)) {

          let search_summary = '';
          if (newParams.category) {
            search_summary = `Category: ${newParams.category}`;
          }

          if (newParams.q) {
            if (newParams.category) {
              search_summary += ", ";
            }

            search_summary += `${newParams.q}`;
          }

          this.updateSearchSummary(search_summary);
        
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
      
      if (str === 'low calorie') {
        return 'calories=lte40kcal';
      } else if (str === 'moderate calorie') {
        return 'calories=lte100kcal';
      } else if (str === 'high calorie') {
        return 'calories=gte100kcal';
      } else if (str === 'low fat') {
        return 'fat=lte3g';
      } else if (str === 'moderate fat') {
        return 'fat=lte7g';
      } else if (str === 'high fat') {
        return 'fat=gt7g';
      } else if (str === 'low protein') {
        return 'protein=lt5g';
      } else if (str === 'high protein') {
        return 'protein=gt10g';
      } else if (str === 'moderate protein') {
        return 'protein=lte10g';
      } else if (str === 'low carb') {
        return 'carbohydrates=lt15g';
      } else if (str === 'high carb') {
        return 'carbohydrates=gt30g';
      } else if (str === 'moderate carb') {
        return 'carbohydrates=lte30g';
      } else if (str === 'low sodium') {
        return 'sodium=lte140mg';
      } else if (str === 'high sodium') {
        return 'sodium=gt400mg';
      } else if (str === 'moderate sodium') {
        return 'sodium=lte400mg';
      } else if (str === 'low fiber') {
        return 'fiber=lt2g';
      } else if (str === 'high fiber') {
        return 'fiber=gt5g';
      } else if (str === 'moderate fiber') {
        return 'fiber=lte5g';
      } else if (str === 'low sugar') {
        return 'sugar=lt5g';
      } else if (str === 'high sugar') {
        return 'sugar=gt15g';
      } else if (str === 'moderate sugar') {
        return 'sugar=lte15g';
      } else if (str === 'zero cholesterol') {
        return 'cholesterol=eq0mg';
      } else if (str === 'low calcium') {
        return 'calcium=lt100mg';
      } else if (str === 'high calcium') {
        return 'calcium=gt200mg';
      } else if (str === 'moderate calcium') {
        return 'calcium=lte200mg';
      } else if (str === 'low vitamin c') {
        return 'vitamin_c=lt10mg';
      } else if (str === 'high vitamin c') {
        return 'vitamin_c=gt30mg';
      } else if (str === 'moderate vitamin c') {
        return 'vitamin_c=lte30mg';
      } else if (str === 'low vitamin a') {
        return 'vitamin_a=lt500IU';
      } else if (str === 'high vitamin a') {
        return 'vitamin_a=gt1000IU';
      } else if (str === 'moderate vitamin a') {
        return 'vitamin_a=lte1000IU';
      } else if (str === 'low iron') {
        return 'iron=lt1mg';
      } else if (str === 'high iron') {
        return 'iron=gt5mg';
      } else if (str === 'moderate iron') {
        return 'iron=lte5mg';
      } else if (str === 'low potassium') {
        return 'potassium=lt100mg';
      } else if (str === 'high potassium') {
        return 'potassium=gt300mg';
      } else if (str === 'moderate potassium') {
        return 'potassium=lte300mg';
      } else if (str === 'low magnesium') {
        return 'magnesium=lt25mg';
      } else if (str === 'high magnesium') {
        return 'magnesium=gt50mg';
      } else if (str === 'moderate magnesium') {
        return 'magnesium=lt50mg';
      } else if (str === 'low vitamin b1') {
        return 'vitamin_b1=lt0.1mg';
      } else if (str === 'high vitamin b1') {
        return 'vitamin_b1=gt0.5mg';
      } else if (str === 'moderate vitamin b1') {
        return 'vitamin_b1=lte0.5mg';
      } else if (str === 'low vitamin b2') {
        return 'vitamin_b2=lt0.1mg';
      } else if (str === 'high vitamin b2') {
        return 'vitamin_b2=gt0.5mg';
      } else if (str === 'moderate vitamin b2') {
        return 'vitamin_b2=lte0.5mg';
      } else if (str === 'low vitamin b3') {
        return 'vitamin_b3=lt1mg';
      } else if (str === 'high vitamin b3') {
        return 'vitamin_b3=gt3mg';
      } else if (str === 'moderate vitamin b3') {
        return 'vitamin_b3=lte3mg';
      } 

      const regex = /(carbohydrates|protein|fat|calories)(>=|<=|>|<|=)(\d+(\.\d+)?)(g|kcal|ml)(?:,|$)/g;
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
        const value = match[3];
     
        const unit = match[5];

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
      const normalizedQuery = query ? query.toLowerCase() : query;

      const keywords = [
        'carbohydrates', 'fat', 'protein',
        'calories', 'low calorie', 'moderate calorie', 'high calorie',
        'low fat', 'high fat', 'moderate fat',
        'low protein', 'high protein', 'moderate protein',
        'low carb', 'high carb', 'moderate carb',
        'low sodium', 'high sodium', 'moderate sodium',
        'low fiber', 'high fiber', 'moderate fiber',
        'low sugar', 'high sugar', 'moderate sugar',
        'zero cholesterol',
        'low calcium', 'high calcium', 'moderate calcium',
        'low vitamin c', 'high vitamin c', 'moderate vitamin c',
        'low vitamin a', 'high vitamin a', 'moderate vitamin a',
        'low iron', 'high iron', 'moderate iron',
        'low potassium', 'high potassium', 'moderate potassium',
        'low magnesium', 'high magnesium', 'moderate magnesium',
        'low vitamin b1', 'high vitamin b1', 'moderate vitamin b1',
        'low vitamin b2', 'high vitamin b2', 'moderate vitamin b2',
        'low vitamin b3', 'high vitamin b3', 'moderate vitamin b3',
      ];
      
      if (normalizedQuery && keywords.some(v => normalizedQuery.includes(v))) {
       
        formattedQuery = this.constructComplexQuery(normalizedQuery);
      } else {
        formattedQuery = normalizedQuery ? `description=${normalizedQuery}` : '';
      }

      return formattedQuery;
    },

    updateSearchResults() {

      const query = this.constructQuery();
      
      const macros_keys = ['total carbohydrates', 'protein', 'total fat'];
      
      const url = this.currentCategory ? `${API_BASE_URI}/foods?${query}&category=${this.currentCategory}&page=${this.currentPage}` : `${API_BASE_URI}/foods?${query}&page=${this.currentPage}`;

      this.isLoading = true;

      axios.get(url)
        .then((res) => {
          const items_per_page = 10;

          this.isLoading = false;

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
          console.log('search err: ', err);
          this.isLoading = false;
        });
    }

  }


});
</script>