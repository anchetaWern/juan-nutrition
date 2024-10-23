<template>
  <v-app-bar flat>
    <v-app-bar-title>
      <a href="/" style="color: #333;">
        <img :src="logo" alt="juan nutrisyon logo" style="width:200px;" />
      </a>
    </v-app-bar-title>

    <template v-slot:append>  

      <v-badge
        v-if="ingredientCount > 0"
        :content="ingredientCount"
        overlap
        color="success"
      >
        <v-btn size="x-small" icon="mdi-chef-hat" @click="goToRecipe"></v-btn>
      </v-badge>

      <v-badge
        v-if="analyzeCount > 0"
        :content="analyzeCount"
        overlap
        color="success"
      >
        <v-btn size="x-small" icon="mdi-chart-box" @click="goToAnalysis"></v-btn>
      </v-badge>

      <v-btn v-if="ingredientCount == 0" size="x-small" icon="mdi-chef-hat" @click="goToRecipe"></v-btn>
      <v-btn v-if="analyzeCount == 0" size="x-small" icon="mdi-chart-box" @click="goToAnalysis"></v-btn>
      

      <v-btn size="x-small" icon="mdi-help" @click="helpDialog = true"></v-btn>
      <v-btn size="x-small" icon="mdi-magnify" @click="dialog = true"></v-btn>
    </template>    

  </v-app-bar>

  <v-dialog
    v-model="dialog"
    width="300"
  >
    <v-card>
      <v-text-field
        hide-details="auto"
        label="What are you looking for?"
        placeholder="Type the name of food"
        v-model="query"
        autofocus
      ></v-text-field>
     
      <v-btn color="primary" block @click="search" rounded="0">Search</v-btn>
    </v-card>

  </v-dialog>

  <v-dialog
    v-model="helpDialog"
    width="auto"
    max-width="350px"
  >
    <template v-slot:default="{ isActive }">
      <v-card title="Help">
        <template v-slot:text>
          This app has two main features: <br>
          <ul class="pt-1 pl-5">
            <li>Searching and viewing nutrient information of foods.</li>
            <li>Diet analysis.</li>
          </ul>
          <br>
          To view food data, you can click on the magnifying glass icon to begin searching. Just type in what you're looking for (eg. <code>Rambutan</code>, <code>high protein</code>, <code>carbohydrates<=2g</code>, <code>high iron</code>, <code>high vitamin c</code>). 
          <br><br>You can click on any of the food categories in the homepage. Note that triggering search while viewing a category will limit the search results to the current category. Be sure to navigate to the homepage before you initiate search if you don't want this behavior.
          <br><br>Results are sorted from smallest nutrition value to the largest. 
          <br><br>Only 10 foods are loaded per page. You can click the left and right arrows at the bottom of each page to navigate through the available pages.

          <br><br>
          To analyze your diet, search for the foods you ate for a day and click on the "Analyze" button. Repeat this step for every food you ate. Once done, click on the graph icon on the top portion of the screen then adjust the serving sizes for each food.<br>
          The summary section is where all the most important nutrients to watch out for is displayed. <br>

          <br>Most of the foods here are from PhilFCT <a href="https://i.fnri.dost.gov.ph/fct/library/starting_pg" target="_blank">(Philippine Food Composition Tables Online Database)</a>
          <br>Some are gathered from the author taking pictures of food labels. If you want to contribute, please visit <a href="https://contribute.juanutrisyon.info" target="_blank">contribute.juanutrisyon.info</a>
          and send me a message at ancheta dot wern at gmail dot com, as it requires an API key to submit food labels.
        
          <br><br>Note that the food categorization still needs a lot of work. The foods are currently categorized via AI so it's not perfect. The categorization tool is still a work in progress.
        </template>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            text="ok"
            variant="flat"
            @click="isActive.value = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

</template>

<script>
import logo from '@/assets/images/juan-nutrisyon.png'
import { ref } from 'vue';

export default {

  props: {
    updateItems: Function,
    ingredientCount: {
      type: Number,
      default: 0
    },

    analyzeCount: {
      type: Number,
      default: 1
    },
  },

  data: () => ({
    logo,
    query: '',
    dialog: false,
    helpDialog: false,
  }),

  methods: {
    search() {
      this.dialog = false;
     
      this.updateItems(this.query);
      this.query = '';
    },

    goToRecipe() {
      this.$router.push('/recipe');
    },

    goToAnalysis() {
      this.$router.push('/analyze');
    }
  }
}
</script>