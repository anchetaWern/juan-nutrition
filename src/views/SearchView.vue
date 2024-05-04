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
  export default {
    data: () => ({
      dialog: false,
      items: [
        { type: 'subheader', title: '' },
        {
          prependAvatar: 'https://assets.unileversolutions.com/v1/79598556.jpg',
          title: 'Pork BBQ',
          subtitle: `300kcal; 50% protein, 50% fat, 0% carbs`,
          to: '/food/pork-bbq'
        },
        { type: 'divider' },
        {
          prependAvatar: 'https://cdn.sanity.io/images/f3knbc2s/production/08253a025ac131d304f32ead20e90560bee717d8-2500x1600.jpg',
          title: 'Kakanin',
          subtitle: `200kcal; 90% carbs, 10% fat`,
          to: '/food/kakanin'
        },
        { type: 'divider' },
        {
          prependAvatar: 'https://www.kawalingpinoy.com/wp-content/uploads/2018/12/pork-belly-lechon-3.jpg',
          title: 'Lechon belly',
          subtitle: '500kcal; 70% fat, 30% protein',
          to: '/food/lechon-belly'
        },
       
      ],
    }),

  
  }
</script>