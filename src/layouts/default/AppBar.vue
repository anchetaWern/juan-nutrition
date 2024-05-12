<template>
  <v-app-bar flat>
    <v-app-bar-title>
      <a href="/" style="color: #333;">
      <v-icon icon="mdi-food" />
      Juan Nutrition
      </a>
    </v-app-bar-title>

    <template v-slot:append>  

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
        v-model="description"
        autofocus
      ></v-text-field>
      <v-btn color="primary" block @click="search" rounded="0">Search</v-btn>
    </v-card>

  </v-dialog>

</template>

<script>

export default {

  props: {
    updateItems: Function 
  },

  data: () => ({
    description: '',
    dialog: false,
  }),

  methods: {
    search() {
      this.dialog = false;
     
      this.updateItems(this.description);
      this.description = '';
    }
  }
}
</script>