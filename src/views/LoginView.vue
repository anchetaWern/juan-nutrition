<template>
 
    <v-container class="mt-5">
        
        <v-text-field
            label="Email"
            v-model="email"
        ></v-text-field>

        <v-text-field
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            name="password"
            @click:append="showPassword = !showPassword"
        ></v-text-field>

        <v-btn color="primary" block @click="login" rounded="0">Login</v-btn>

        <div class="mt-2 text-center">
            <a href="/register">Create account</a>
        </div>
    </v-container>
 
</template>


<script>
import { ref } from 'vue';
import { auth } from '@/firebase.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { createToast } from 'mosha-vue-toastify'
import 'mosha-vue-toastify/dist/style.css'

import axios from 'axios';

const API_BASE_URI = import.meta.env.VITE_API_URI;

export default {

    data: () => ({
        email: '',
        password: '',
        showPassword: false
    }),
    

    methods: {

        async login() {
         
            try {
                const userCredential = await signInWithEmailAndPassword(
                    auth,
                    this.email,
                    this.password
                );

                const user = userCredential.user;

                console.log('uid: ', user.uid);

                const token = await user.getIdToken();
                
                const res = await axios.post(`${API_BASE_URI}/firebase-auth/sync`, 
                    { 
                        token
                    }, 
                );
                
                console.log('api key: ', res.data.user.api_key);

                localStorage.setItem('api_key', res.data.user.api_key);
             
                createToast(
                    {
                        title: 'Login successful',
                        description: "You'll now be redirected to the homepage."
                    }, 
                    { type: 'success', position: 'bottom-right' }
                );

                this.$router.push(`/`);

            } catch (error) {

                console.log('error: ', error);
              
                createToast(
                    {
                        title: 'Error logging in.',
                        description: "Please check your credentials."
                    }, 
                    { type: 'danger', position: 'bottom-right' }
                );

            }
        
        }

    }
}
</script>