import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia';

import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css';



// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import axios from 'axios'

import { createHead } from '@vueuse/head'

const API_BASE_URI = import.meta.env.VITE_API_URI

localStorage.clear();


const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)
const head = createHead()
const pinia = createPinia()

app.use({
  install() {

    if (!sessionStorage.getItem('food_types')) {
      const food_types_url = `${API_BASE_URI}/food-types`;
      axios.get(food_types_url)
        .then((res) => {
          sessionStorage.setItem('food_types', JSON.stringify(res.data));
        })
        .catch((err) => {
          console.log('err: ', err);
        });
    } 

  }
});

app.use(router)
app.use(vuetify)
app.use(pinia)
app.use(head)

app.mount('#app')