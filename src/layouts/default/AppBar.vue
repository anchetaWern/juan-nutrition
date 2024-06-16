<template>
  <v-app-bar flat>
    <v-app-bar-title>
      <a href="/" style="color: #333;">
      <v-icon icon="mdi-food" />
      Juan Nutrisyon
      </a>
    </v-app-bar-title>

    <template v-slot:append>  
      <v-btn icon="mdi-help" @click="helpDialog = true"></v-btn>
      <v-btn icon="mdi-magnify" @click="dialog = true"></v-btn>
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
  >
    <template v-slot:default="{ isActive }">
      <v-card title="Help">
        <template v-slot:text>
          You can click on the magnifying glass icon to begin searching. Just type in what you're looking for (eg. <code>Rambutan</code>, <code>high protein</code>, <code>carbohydrates<=2g</code>, <code>high iron</code>, <code>high vitamin c</code>). 
          <br><br>You can click on any of the food categories in the homepage. Note that triggering search while viewing a category will limit the search results to the current category. Be sure to navigate to the homepage before you initiate search if you don't want this behavior.
          <br><br>Results are sorted from smallest nutrition value to the largest. 
          <br><br>Only 10 food items is loaded per page. You can click the left and right arrows at the bottom of each page to navigate through the available pages.
          <br><br>In the food page, you can see the nutritional values you'll typically get from consuming the specified serving size. 
          <br>It is compared to the daily recommended values and is color-coded so you can easily see whether a food is dense with a specific nutrient. Red = high, orange = moderate, blue = low.
          <br><br>The daily recommended values have two sources. It is primarily from DOST-FNRI's (Department of Science and Technology - Food and Nutrition Research Institute) Philippine Dietary Reference Intakes (PDRI). 
          <br>This was previously called RENI or Recommended Energy and Nutrient Intakes. The terms are interchangeable provided most of the food labels in various food items today are still using the RENI 2002 edition. 
          <br>The reference values for the daily limits are mostly using male, 19 to 29 years old. Though some food items such as powdered milk or baby food are using reference values from their respective target population.
          <br><br>In cases where the daily value isn't available in PDRI, FDA's daily values are used: https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
          <br><br>Most of the food items here are from PhilFCT (Philippine Food Composition Tables Online Database) https://i.fnri.dost.gov.ph/fct/library/starting_pg
          <br>Some are gathered from the author taking pictures of food labels in common grocery items. If you want to contribute, be sure to visit <a href="https://contribute.juanutrisyon.info" target="_blank">contribute.juanutrisyon.info</a>
          and send me a message at ancheta dot wern at gmail dot com, as it requires an API key to submit food labels.
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

export default {

  props: {
    updateItems: Function 
  },

  data: () => ({
    query: '',
    dialog: false,
    helpDialog: false
  }),

  methods: {
    search() {
      this.dialog = false;
     
      this.updateItems(this.query);
      this.query = '';
    }
  }
}
</script>