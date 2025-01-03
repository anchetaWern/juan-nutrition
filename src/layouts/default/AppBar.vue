<template>
  <v-app-bar flat>
    <v-app-bar-title>
      <a href="/" style="color: #333;">
        <img :src="logo" alt="juan nutrisyon logo" style="width:150px;" />
      </a>
    </v-app-bar-title>

    <template v-slot:append>  
      <v-btn size="x-small" icon="mdi-login" @click="goToLogin" v-if="!loggedInUser"></v-btn>

      <v-btn size="x-small" icon="mdi-logout" @click="logoutUser" v-if="loggedInUser"></v-btn>

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
            <li>Recipe analysis.</li>
          </ul>
          <br>
          To view food data, you can click on the magnifying glass icon to begin searching. Just type in what you're looking for (eg. <code>Rambutan</code>, <code>high protein</code>, <code>carbohydrates<=2g</code>, <code>high iron</code>, <code>high vitamin c</code>). 
          <br><br>You can click on any of the food categories in the homepage. Note that triggering search while viewing a category will limit the search results to the current category. Be sure to navigate to the homepage before you initiate search if you don't want this behavior.
          <br><br>Results are sorted from smallest nutrition value to the largest. 
          <br><br>Only 10 foods are loaded per page. You can click the left and right arrows at the bottom of each page to navigate through the available pages.

          <br><br>
          To <a href="/analyze">analyze your diet</a>, search for the foods you ate for a day and click on the "Analyze" button. Repeat this step for every food you ate. Once done, click on the graph icon on the top portion of the screen then adjust the serving sizes for each food.<br>
          The summary section is where all the most important nutrients to watch out for is displayed. <br>

          <br>
          You can use the <a href="/recipe">recipe analysis</a> tool to analyze the nutrient content of a recipe. Recipe analysis works the same way as diet analysis: search for the individual ingredients and add them to a recipe. 
          You will then be able to view the nutrient content of the recipe.
          You can also save your recipe for other users to view and modify.  

          <br>
          <br>Most of the foods here are from PhilFCT <a href="https://i.fnri.dost.gov.ph/fct/library/starting_pg" target="_blank">(Philippine Food Composition Tables Online Database)</a>
          <br>Some are gathered from the author taking pictures of food labels. If you want to contribute, <a href="/register">create an account</a> then visit<a href="https://contribute.juanutrisyon.info" target="_blank">contribute.juanutrisyon.info</a>.

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
import { auth } from '@/firebase.js';
import { signOut } from "firebase/auth";
import { createToast } from 'mosha-vue-toastify'
import 'mosha-vue-toastify/dist/style.css'

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

    loggedInUser: {
      type: Object,
    }
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

    goToLogin() {
      this.$router.push('/login');
    },

    goToRecipe() {
      this.$router.push('/recipe');
    },

    goToAnalysis() {
      this.$router.push('/analyze');
    },

    async logoutUser() {
     
      try {
        await signOut(auth);
       
        createToast(
          {
            title: 'Logout successful',
          }, 
          { type: 'success', position: 'bottom-right' }
        );

      } catch (error) {
        console.error("Error logging out:", error.message);
      }
    }
  }
}
</script>